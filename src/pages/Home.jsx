import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Delicious Food, Simple Ordering</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Order your favorite dishes with our easy token system. No waiting in lines!
            </p>
            <Link to="/menu" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
              View Menu
            </Link>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-light">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Browse & Order</h3>
                <p className="text-gray-600">Browse our menu and add items to your cart</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Get Your Token</h3>
                <p className="text-gray-600">Receive a unique token for your order</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Pick Up & Enjoy</h3>
                <p className="text-gray-600">Show your token and collect your food</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-dark text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} FoodToken. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home