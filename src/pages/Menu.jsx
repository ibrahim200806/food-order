import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { toast } from 'react-toastify'

function Menu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products')
      }
      
      setProducts(data)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(product => product.category))]
      setCategories(uniqueCategories)
      
      setLoading(false)
    } catch (error) {
      toast.error(error.message || 'Error loading products')
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
        
        {/* Category Filter */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  category === categories[categories.length - 1] ? 'rounded-r-lg' : ''
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Menu