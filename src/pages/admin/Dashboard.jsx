import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { toast } from 'react-toastify'

function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data')
      }
      
      setStats(data.stats)
      setRecentOrders(data.recentOrders)
      setLoading(false)
    } catch (error) {
      toast.error(error.message || 'Error loading dashboard data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-600">Loading dashboard data...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Completed Orders</p>
              <p className="text-2xl font-semibold">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-2xl font-semibold">₹{stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium">Token: {order.token}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link to="/admin/orders" className="text-primary hover:text-primary/80 text-sm font-medium">
                View All Orders
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Quick Stats</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{stats.totalUsers}</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">Total Products</span>
                <span className="font-semibold">{stats.totalProducts}</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-600">Ready for Pickup</span>
                <span className="font-semibold">{stats.readyOrders}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Today's Revenue</span>
                <span className="font-semibold">₹{stats.revenue.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Link 
                to="/admin/products" 
                className="btn bg-primary/10 text-primary hover:bg-primary/20 text-center"
              >
                Manage Products
              </Link>
              
              <Link 
                to="/admin/users" 
                className="btn bg-primary/10 text-primary hover:bg-primary/20 text-center"
              >
                View Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard