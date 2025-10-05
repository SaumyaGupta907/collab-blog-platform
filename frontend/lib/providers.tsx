"use client"

import type React from "react"
import { ApolloProvider } from "@apollo/client/react"
import { apolloClient } from "./apollo-client"
import { AuthProvider } from "./auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  )
}