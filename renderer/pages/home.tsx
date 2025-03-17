"use client"

import React, { useState, useEffect, useRef } from "react"
import Head from "next/head"
import Navbar from "../components/ui/navbar"

export default function HomePage() {
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 })
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts, setMaxAttempts] = useState(Math.floor(Math.random() * 5) + 5) // 5-10 attempts
  const [canClick, setCanClick] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([])

  // Initialize particles for background
  useEffect(() => {
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.3 + 0.1,
      })
    }
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: (particle.y + particle.speed) % 100,
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const moveButton = () => {
    if (containerRef.current) {
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Don't let button go too close to edges
      const maxX = 90
      const maxY = 90
      const minX = 10
      const minY = 20 // Account for navbar

      const newX = Math.random() * (maxX - minX) + minX
      const newY = Math.random() * (maxY - minY) + minY

      setButtonPosition({ x: newX, y: newY })
      setAttempts((prev) => {
        const newAttempts = prev + 1
        if (newAttempts >= maxAttempts) {
          setCanClick(true)
        }
        return newAttempts
      })
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>SHITWARE.AI - Home</title>
      </Head>

      <Navbar />

      <div ref={containerRef} className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Animated background particles */}
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-blue-500 opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transition: "top 0.5s linear",
            }}
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">SHITWARE.AI</span>
          </h1>

          <p className="text-gray-400 max-w-md mb-12">We are in your walls... and so are you in ours.</p>

          {/* Moving button */}
          <div className="relative w-full h-64">
            <a
              href={canClick ? "/data" : "#"}
              onClick={(e) => {
                if (!canClick) {
                  e.preventDefault()
                  moveButton()
                }
              }}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                px-6 py-3 rounded-lg text-white font-medium
                transition-all duration-300
                ${
                  canClick
                    ? "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/30"
                    : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                }
              `}
              style={{
                left: `${buttonPosition.x}%`,
                top: `${buttonPosition.y}%`,
                transition: canClick ? "all 0.3s ease" : "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {canClick ? "Start Spying" : `Catch Me if you can lil bro`}
            </a>
          </div>

          {attempts > 0 && !canClick && (
            <p className="text-gray-500 mt-8 animate-pulse">
              Keep trying... {maxAttempts - attempts} more {maxAttempts - attempts === 1 ? "click" : "clicks"} to go
            </p>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}
