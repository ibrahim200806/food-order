import React from 'react'
import { useCart } from '../contexts/CartContext'
import { toast } from 'react-toastify'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  
  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="card">
      <img 
        src={product.image_url} 
        alt={product.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-primary font-bold">₹{product.price.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard