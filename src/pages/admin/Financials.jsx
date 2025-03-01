import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { toast } from 'react-toastify'

function Financials() {
  const [financials, setFinancials] = useState({
    today: {
      revenue: 0,
      orderCount: 0,
      averageOrderValue: 0
    },
    thisWeek: {
      revenue: 0,
      orderCount: 0,
      averageOrderValue: 0
    },
    thisMonth: {
      revenue: 0,
      orderCount: 0,
      averageOrderValue: 0
    },
    allTime: {
      revenue: 0,
      orderCount: 0,
      averageOrderValue: 0
    }
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancials()
  }, [])

  const fetchFinancials = async () => {
    try {
      const response = await fetch('/api/admin/financials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch financial data')
      }
      
      setFinancials(data.stats)
      setRecentTransactions(data.recentTransactions)
      setLoading(false)
    } catch (error) {
      toast.error(error.message || 'Error loading financial data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-600">Loading financial data...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Today</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">₹{financials.today.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders</span>
              <span className="font-medium">{financials.today.orderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Order</span>
              <span className="font-medium">₹{financials.today.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">This Week</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">₹{financials.thisWeek.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders</span>
              <span className="font-medium">{financials.thisWeek.orderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Order</span>
              <span className="font-medium">₹{financials.thisWeek.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">This Month</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">₹{financials.thisMonth.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders</span>
              <span className="font-medium">{financials.thisMonth.orderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Order</span>
              <span className="font-medium">₹{financials.thisMonth.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">All Time</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">₹{financials.allTime.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders</span>
              <span className="font-medium">{financials.allTime.orderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Order</span>
              <span className="font-medium">₹{financials.allTime.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.id.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.user.name}</div>
                    <div className="text-sm text-gray-500">{transaction.user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{transaction.total.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default Financials