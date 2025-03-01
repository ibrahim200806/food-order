import React from 'react'

function OrderStatusBadge({ status }) {
  let bgColor = ''
  
  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-500'
      break
    case 'preparing':
      bgColor = 'bg-blue-500'
      break
    case 'ready':
      bgColor = 'bg-green-500'
      break
    case 'completed':
      bgColor = 'bg-gray-500'
      break
    default:
      bgColor = 'bg-gray-300'
  }
  
  return (
    <span className={`${bgColor} text-white text-xs px-2 py-1 rounded-full uppercase`}>
      {status}
    </span>
  )
}

export default OrderStatusBadge