"use client"

import { useQuery } from "@apollo/client/react"
import { gql } from "@apollo/client/core"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, User, Sparkles } from "lucide-react"
import { format } from "date-fns"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    username: string
  }
}

interface PostsData {
  posts: Post[]
}

const POSTS_QUERY = gql`
  query GetPosts {
    posts {
      id
      title
      content
      createdAt
      author {
        username
      }
    }
  }
`

export default function HomePage() {
  const { data, loading, error } = useQuery<PostsData>(POSTS_QUERY)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading posts: {error.message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure your GraphQL server is running on http://localhost:4000/graphql
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const posts = data?.posts || []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Latest Posts
            </h1>
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="shadow-lg border-2">
            <CardContent className="text-center py-16">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-xl">No posts yet. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {posts.map((post: Post) => (
              <Card
                key={post.id}
                className="hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 backdrop-blur-sm bg-card/95"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-lg line-clamp-3 leading-relaxed">{post.content}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                      <User className="h-4 w-4" />
                      <span>{post.author.username}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {post.createdAt && !isNaN(new Date(post.createdAt).getTime())
                          ? format(new Date(post.createdAt), "MMM d, yyyy")
                          : "Date unavailable"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
