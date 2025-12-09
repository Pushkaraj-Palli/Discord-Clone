'use client'

import { useState } from 'react'
import { getCookie } from 'cookies-next'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkAuth = () => {
    const token = getCookie('auth_token')
    const info = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'luffy@gmail.com',
          password: '123456'
        })
      })

      const result = await response.json()
      setDebugInfo({
        ...debugInfo,
        loginTest: {
          status: response.status,
          ok: response.ok,
          result
        }
      })
    } catch (error) {
      setDebugInfo({
        ...debugInfo,
        loginTest: {
          error: error.message
        }
      })
    }
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkAuth}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Check Auth Status
        </button>
        
        <button 
          onClick={testLogin}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 ml-4"
        >
          Test Login API
        </button>
      </div>

      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h2 className="text-lg font-semibold mb-2">Debug Results:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}