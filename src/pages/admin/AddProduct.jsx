import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { toast } from 'react-toastify'

function AddProduct() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name || !description || !price || !category || !imageUrl) {
      toast.error('Please fill in all fields')
      return
    }
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category,
          image_url: imageUrl
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product')
      }
      
      toast.success('Product added successfully')
      navigate('/admin/products')
    } catch (error) {
      toast.error(error.message || 'Error adding product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input w-full"
                placeholder="E.g., Appetizer, Main Course, Dessert"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input w-full"
                placeholder="Enter price"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input w-full"
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="input w-full"
                placeholder="Enter product description"
              ></textarea>
            </div>
          </div>
          
          {imageUrl && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-1">Image Preview</p>
              <img 
                src={imageUrl} 
                alt="Product preview" 
                className="h-40 w-40 object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image'
                }}
              />
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AddProduct