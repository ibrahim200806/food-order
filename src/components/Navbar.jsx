import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">FoodToken</Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
          
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link>
              ) : (
                <>
                  <Link to="/order-history" className="hover:text-primary transition-colors">My Orders</Link>
                  <Link to="/cart" className="hover:text-primary transition-colors relative">
                    Cart
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button 
                onClick={handleLogout}
                className="hover:text-primary transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar