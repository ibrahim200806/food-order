import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('=== Registration Attempt ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required',
        details: {
          name: !!name,
          email: !!email,
          phone: !!phone,
          password: !!password
        }
      });
    }
    
    // Check for Supabase connection
    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    try {
      // Comprehensive user existence check
      const { data: existingUsers, error: queryError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},phone.eq.${phone}`);
      
      console.log('Existing Users Check:', {
        existingUsers: existingUsers?.length || 0,
        queryError
      });
      
      if (queryError) {
        console.error('Existing User Query Error:', queryError);
        return res.status(500).json({ 
          message: 'Error checking user existence', 
          error: queryError.message,
          details: queryError
        });
      }
      
      if (existingUsers && existingUsers.length > 0) {
        console.log('Duplicate User Found:', existingUsers);
        return res.status(400).json({ 
          message: 'User with this email or phone already exists',
          details: existingUsers.map(u => ({
            id: u.id,
            email: u.email,
            phone: u.phone
          }))
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Prepare user data
      const newUser = {
        name, 
        email, 
        phone, 
        password: hashedPassword,
        role: 'user' // Default role
      };
      
      console.log('Attempting to insert user:', {
        ...newUser,
        password: '[REDACTED]'
      });
      
      // Insert user with detailed error handling
      const { data: createdUser, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select();
      
      console.log('User Insertion Result:', {
        createdUser,
        insertError
      });
      
      if (insertError) {
        console.error('Detailed Insertion Error:', {
          message: insertError.message,
          details: insertError,
          code: insertError.code
        });
        
        return res.status(500).json({ 
          message: 'Failed to create user in database',
          error: insertError.message,
          code: insertError.code,
          details: insertError
        });
      }
      
      if (!createdUser || createdUser.length === 0) {
        console.error('No user data returned after insert');
        return res.status(500).json({ 
          message: 'User created but no data returned',
          details: 'Unexpected database behavior'
        });
      }
      
      const userRecord = createdUser[0];
      
      // Create token
      const token = jwt.sign(
        { id: userRecord.id, role: userRecord.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = userRecord;
      
      console.log('Registration Successful:', {
        userId: userRecord.id,
        email: userRecord.email
      });
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (dbError) {
      console.error('Comprehensive Database Error:', dbError);
      res.status(500).json({ 
        message: 'Unexpected database error',
        error: dbError.message,
        details: dbError
      });
    }
  } catch (error) {
    console.error('Registration Unexpected Error:', error);
    res.status(500).json({ 
      message: 'Unexpected server error during registration', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      console.log('Missing phone or password');
      return res.status(400).json({ message: 'Phone and password are required' });
    }
    
    // Find user with the provided phone
    console.log('Searching for user with phone:', phone);
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone);
    
    console.log('Query results:', { 
      found: users?.length > 0, 
      count: users?.length, 
      error: queryError 
    });
    
    if (queryError) {
      console.error('Error finding user:', queryError);
      return res.status(500).json({ message: 'Error finding user', error: queryError });
    }
    
    if (!users || users.length === 0) {
      console.log('No user found with phone:', phone);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    console.log('Found user:', { 
      id: user.id, 
      name: user.name, 
      role: user.role, 
      phone: user.phone,
      passwordExists: !!user.password 
    });
    
    // Check password
    console.log('Comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    console.log('Creating token for user ID:', user.id);
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', user.name, 'with role:', user.role);
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching products...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    console.log('Products response:', { data: data?.length || 0, error });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    console.log(`Returning ${data?.length || 0} products`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Order routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    console.log('=== Order Creation Attempt ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated User:', req.user);

    // Destructure and validate input
    const { items, total, user_id } = req.body;

    // Validate user_id matches authenticated user
    if (user_id !== req.user.id) {
      console.error('User ID mismatch', { 
        requestedUserId: user_id, 
        authenticatedUserId: req.user.id 
      });
      return res.status(403).json({ 
        message: 'Unauthorized order creation' 
      });
    }

    // Comprehensive input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid items:', items);
      return res.status(400).json({ 
        message: 'Invalid order items',
        details: 'Order must contain at least one item'
      });
    }

    // Validate total
    const calculatedTotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    const totalMatchesCalculated = Math.abs(calculatedTotal - total) < 0.01;
    
    if (!totalMatchesCalculated) {
      console.error('Total mismatch', { 
        providedTotal: total, 
        calculatedTotal: calculatedTotal 
      });
      return res.status(400).json({ 
        message: 'Invalid order total',
        details: 'Order total does not match item prices'
      });
    }

    // Generate unique order token
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Generated Order Token:', token);

    // Prepare order data
    const orderData = {
      user_id,
      items: JSON.stringify(items),  // Store as JSON string
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      token
    };

    // Insert order into database
    console.log('Inserting order:', orderData);
    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    // Handle insertion errors
    if (error) {
      console.error('Order Insertion Error:', error);
      return res.status(500).json({ 
        message: 'Failed to create order',
        error: error.message,
        details: error.details || 'Database insertion failed'
      });
    }

    // Log successful order creation
    console.log('Order Created Successfully:', {
      orderId: order.id,
      token: order.token,
      total: order.total
    });

    // Return created order
    res.status(201).json(order);
  } catch (error) {
    // Catch any unexpected errors
    console.error('=== Unexpected Order Creation Error ===');
    console.error(error);

    res.status(500).json({ 
      message: 'Unexpected server error during order creation',
      error: error.message,
      details: process.env.NODE_ENV === 'development' 
        ? error.stack 
        : 'An unexpected error occurred'
    });
  }
});

// Get user's orders
app.get('/api/orders/user', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get specific order details
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, user:users(name, phone)')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is admin or the order belongs to the user
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Admin routes for orders
app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, user:users(name, phone)')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Update order status (admin only)
app.put('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// Admin dashboard route
app.get('/api/admin/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get stats
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');
    
    if (ordersError) {
      throw ordersError;
    }
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'admin');
    
    if (usersError) {
      throw usersError;
    }
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      throw productsError;
    }
    
    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const readyOrders = orders.filter(order => order.status === 'ready').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalUsers = users.length;
    const totalProducts = products.length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('*, user:users(name, phone)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentOrdersError) {
      throw recentOrdersError;
    }
    
    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        readyOrders,
        completedOrders,
        totalUsers,
        totalProducts,
        revenue
      },
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Admin financial overview route
app.get('/api/admin/financials', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, user:users(name, phone)')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter orders by date
    const todayOrders = orders.filter(order => new Date(order.created_at) >= todayStart);
    const weekOrders = orders.filter(order => new Date(order.created_at) >= weekStart);
    const monthOrders = orders.filter(order => new Date(order.created_at) >= monthStart);
    
    // Calculate stats
    const calculateStats = (orderList) => {
      const revenue = orderList.reduce((sum, order) => sum + order.total, 0);
      const orderCount = orderList.length;
      const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
      
      return {
        revenue,
        orderCount,
        averageOrderValue
      };
    };
    
    const stats = {
      today: calculateStats(todayOrders),
      thisWeek: calculateStats(weekOrders),
      thisMonth: calculateStats(monthOrders),
      allTime: calculateStats(orders)
    };
    
    // Get recent transactions (completed orders)
    const recentTransactions = orders.slice(0, 10);
    
    res.json({
      stats,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ message: 'Server error fetching financial data' });
  }
});

// Admin users route
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get users with order count
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        orders:orders(id)
      `)
      .neq('role', 'admin');
    
    if (error) {
      throw error;
    }
    
    // Format response to include order count
    const formattedUsers = users.map(user => {
      const { orders, password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        order_count: orders.length
      };
    });
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Admin product management routes
app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        { name, description, price, category, image_url }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error adding product' });
  }
});

app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update({ name, description, price, category, image_url })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('JWT Secret:', process.env.JWT_SECRET ? 'Configured' : 'NOT SET');
});

export default app;