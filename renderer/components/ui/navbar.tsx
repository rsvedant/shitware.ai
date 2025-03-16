import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  
  // Handle scroll effect for transparency
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])
  
  const navItems = [
    { name: 'Home', path: '/home' }
  ]
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900 bg-opacity-80 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-gray-300 font-semibold text-lg tracking-wider">
              SHITWARE.AI
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div 
                key={item.name}
                className="relative"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <Link 
                  href={item.path}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    router.pathname === item.path 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
                
                {/* Animated underline */}
                <div 
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${
                    router.pathname === item.path 
                      ? 'w-full' 
                      : hoverIndex === index 
                        ? 'w-full opacity-50' 
                        : 'w-0 opacity-0'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
