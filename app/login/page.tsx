'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hash, CheckCircle, Eye, EyeOff } from "lucide-react"
import { setCookie } from 'cookies-next'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Check for success message from URL params on client side only
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const registered = urlParams.get('registered')
      if (registered) {
        setSuccess('Account created successfully! You can now log in.')
      }
      
      // Clear any credentials from URL (security fix)
      if (urlParams.has('email') || urlParams.has('password')) {
        console.warn('Credentials found in URL - clearing for security')
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setError('')
    setLoading(true)

    try {
      // Validate form data before sending
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields')
      }

      console.log('Submitting login form...')
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'same-origin'
      })

      console.log('Response status:', res.status)

      if (!res.ok) {
        // Handle different error responses
        let errorMessage = 'Something went wrong'
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${res.status} ${res.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('Login successful, setting cookie and redirecting...')

      // Set the token in a cookie
      setCookie('auth_token', data.token, {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax', // Changed from strict for better compatibility
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false // Allow client-side access
      })

      // Clear form data for security
      setFormData({ email: '', password: '' })

      // Force page reload to ensure cookie is recognized
      window.location.href = '/'
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 relative">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
            <Hash className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">Welcome back!</h2>
        <p className="text-gray-400 text-center mb-8">We're so excited to see you again!</p>

        {success && (
          <div className="mb-6 p-3 bg-green-900/30 border border-green-500 rounded-md flex items-center text-green-400">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} action="javascript:void(0)" method="post">
          <fieldset disabled={loading} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                EMAIL
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </fieldset>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-white">Logging in...</span>
          </div>
        </div>
      )}
    </div>
  )
} 