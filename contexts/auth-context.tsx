"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Enable this to use mock auth flow without a backend
const USE_MOCK_AUTH = true

type User = {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  bio?: string
  company?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUserProfile: (updatedUser: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Initialize as false to avoid hydration mismatch
  const router = useRouter()

  // Check auth state on mount only (not during server-side rendering)
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      // If we're using mock auth, check for mock token
      if (USE_MOCK_AUTH) {
        const token = localStorage.getItem("token")
        const mockUser = localStorage.getItem("mockUser")
        
        if (token && mockUser) {
          try {
            setUser(JSON.parse(mockUser))
          } catch (error) {
            console.error("Failed to parse mock user data:", error)
            localStorage.removeItem("token")
            localStorage.removeItem("mockUser")
          }
        }
        
        setIsLoading(false)
        return
      }

      // Only try to validate the token with the backend if not using mock auth
      const token = localStorage.getItem("token")
      if (token) {
        try {
          // Call backend to validate token and get user data
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token")
            setUser(null)
          }
        } catch (error) {
          console.error("Failed to validate auth token:", error)
          localStorage.removeItem("token")
          setUser(null)
        }
      }

      setIsLoading(false)
    }

    // Only run on client-side
    if (typeof window !== "undefined") {
      checkAuth()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      if (USE_MOCK_AUTH) {
        // Mock login process
        const mockUser = {
          id: "mock-1",
          name: email.split('@')[0].replace(/[.]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
        }

        // Set user in state and mock token
        localStorage.setItem("token", "mock-token-" + Date.now())
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        setUser(mockUser)
        
        // Small delay to ensure state updates before redirect
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        // Set auth cookie for middleware
        document.cookie = "auth=true; path=/; max-age=86400"
        
        // Redirect to dashboard
        router.push("/dashboard")
        return
      }

      // Call backend login API only if not using mock auth
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to login")
      }

      const data = await response.json()

      // Store token and user data
      localStorage.setItem("token", data.token)
      setUser(data.user)
      
      // Set auth cookie for middleware
      document.cookie = "auth=true; path=/; max-age=86400"

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      if (USE_MOCK_AUTH) {
        // Mock signup process
        const mockUser = {
          id: "mock-" + Date.now(),
          name: name,
          email: email,
        }

        // Store token and user data
        localStorage.setItem("token", "mock-token-" + Date.now())
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        setUser(mockUser)
        
        // Set auth cookie for middleware
        document.cookie = "auth=true; path=/; max-age=86400"

        // Redirect to dashboard
        router.push("/dashboard")
        return
      }

      // Call backend register API only if not using mock auth
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to register")
      }

      const data = await response.json()

      // Store token and user data
      localStorage.setItem("token", data.token)
      setUser(data.user)
      
      // Set auth cookie for middleware
      document.cookie = "auth=true; path=/; max-age=86400"

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear user from state and localStorage
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("mockUser")
    // Do NOT remove deliveries from localStorage here
    // This ensures statistics persist between sessions

    // Remove auth cookie
    document.cookie = "auth=; path=/; max-age=0"

    router.push("/")
  }

  const updateUserProfile = async (updatedUser: User) => {
    try {
      if (USE_MOCK_AUTH) {
        // Update the mock user
        setUser(updatedUser)
        localStorage.setItem("mockUser", JSON.stringify(updatedUser))
        return
      }
      
      const token = localStorage.getItem("token")
      
      // Call backend update profile API
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Profile update failed:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

