"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apolloClient } from "./apollo-client"
import { gql } from "@apollo/client/core"

// GraphQL queries and mutations
const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`

// TypeScript interfaces for GraphQL responses
interface User {
  id: string
  username: string
  email: string
}

interface LoginResponse {
  login: {
    token: string
    user: User
  }
}

interface RegisterResponse {
  register: {
    token: string
    user: User
  }
}

interface MeResponse {
  me: User
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await apolloClient.query<MeResponse>({
          query: ME_QUERY,
          fetchPolicy: "network-only",
        })
        if (data?.me) {
          setUser(data.me)
        }
      } catch (error) {
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await apolloClient.mutate<LoginResponse>({
      mutation: LOGIN_MUTATION,
      variables: { email, password },
    })

    if (data) {
      localStorage.setItem("token", data.login.token)
      setUser(data.login.user)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    const { data } = await apolloClient.mutate<RegisterResponse>({
      mutation: REGISTER_MUTATION,
      variables: { username, email, password },
    })

    if (data) {
      localStorage.setItem("token", data.register.token)
      setUser(data.register.user)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    apolloClient.clearStore()
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
