import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

function Cart() {
  const { cartItems, total, removeFromCart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      console.log('Placing Order:', {
        items: cartItems,
        total,
        user: user?.id
      })

      // Prepare order data with validation
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url
        })),
        total: parseFloat(total.toFixed(2)),
        user_id: user.id
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      // Log full response for debugging
      console.log('Response Status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw Response Text:', responseText);

      // Attempt to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parsing Error:', parseError);
        console.error('Unparseable Response:', responseText);
        
        // Provide more context about the parsing failure
        throw new Error(`Failed to parse server response. Status: ${response.status}. Response: ${responseText}`);
      }

      // Check for error in parsed response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }
      
      // Clear cart and navigate
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${data.id}`)
    } catch (error) {
      console.error('Complete Order Error:', error);
      
      // More detailed error toast
      toast.error(error.message || 'Error placing order', {
        autoClose: false,
        closeOnClick: true,
        pauseOnHover: true
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/menu')}
              className="btn btn-primary"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={item.image_url} 
                                alt={item.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{item.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="text-gray-500 focus:outline-none focus:text-gray-600"
                            >
                              <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </button>
                            <span className="text-gray-700 mx-2">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="text-gray-500 focus:outline-none focus:text-gray-600"
                            >
                              <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800 font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-b py-2 mb-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="text-lg font-bold text-primary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    className="btn btn-primary w-full mt-4"
                  >
                    Place Order
                  </button>
                  
                  <button
                    onClick={() => navigate('/menu')}
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 w-full mt-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Cart