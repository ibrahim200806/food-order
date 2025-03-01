import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { toast } from 'react-toastify'

function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      console.log('Fetching order with ID:', id);
      
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('Response Status:', response.status);
      
      // Log raw response text for debugging
      const responseText = await response.text();
      console.log('Raw Response Text:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parsing Error:', parseError);
        setError(`Failed to parse response: ${responseText}`);
        setLoading(false);
        return;
      }

      // Check for error response
      if (!response.ok) {
        console.error('Error Response:', data);
        setError(data.message || 'Failed to fetch order');
        setLoading(false);
        return;
      }
      
      console.log('Fetched Order Data:', data);
      setOrder(data)
      setLoading(false)
    } catch (error) {
      console.error('Comprehensive Fetch Error:', error);
      setError(error.message || 'Error loading order')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">Error: {error}</p>
            <Link to="/menu" className="btn btn-primary">
              Return to Menu
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Order not found</p>
            <Link to="/menu" className="btn btn-primary">
              Return to Menu
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary text-white p-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-lg">Thank you for your order</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6 text-center">
              <p className="text-gray-600 mb-2">Your Order Token</p>
              <div className="text-4xl font-bold text-primary bg-primary/10 py-3 px-6 rounded-lg inline-block">
                {order.token}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Show this token when you pick up your order
              </p>
            </div>
            
            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order ID</span>
                <span className="text-gray-800">{order.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date</span>
                <span className="text-gray-800">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            
            <div className="space-y-4 mb-6">
              {JSON.parse(order.items).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <img 
                        className="h-12 w-12 rounded-full object-cover" 
                        src={item.image_url} 
                        alt={item.name} 
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-800 font-medium">{item.name}</p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <Link to="/menu" className="btn btn-primary">
                Order More
              </Link>
              <Link to="/order-history" className="btn bg-gray-200 text-gray-800 hover:bg-gray-300">
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default OrderConfirmation