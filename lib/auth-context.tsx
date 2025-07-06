"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "./api"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  studentId?: string
  specialization?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    specialization: string;
  }) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.me()
      if (response.success && response.user) {
        setUser(response.user)
        // Stocker le rôle dans localStorage pour la redirection
        localStorage.setItem('userRole', response.user.role)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      if (response.success && response.user) {
        setUser(response.user)
        // Stocker le rôle dans localStorage pour la redirection
        localStorage.setItem('userRole', response.user.role)
      } else {
        throw new Error(response.message || 'Erreur de connexion')
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    specialization: string;
  }) => {
    try {
      const response = await authAPI.register(userData)
      if (response.success && response.user) {
        setUser(response.user)
      } else {
        throw new Error(response.message || 'Erreur d\'inscription')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('userRole')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
