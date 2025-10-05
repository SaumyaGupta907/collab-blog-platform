"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useAuth } from "@/lib/auth-context"
import { PenSquare, LogOut, User, Sparkles } from "lucide-react"

export function BlogNav() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold group">
            <Sparkles className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              BlogApp
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </div>
                <Button asChild size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/create">
                    <PenSquare className="h-4 w-4 mr-2" />
                    New Post
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="shadow-sm hover:shadow-md transition-shadow bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="shadow-sm hover:shadow-md transition-shadow bg-transparent"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
