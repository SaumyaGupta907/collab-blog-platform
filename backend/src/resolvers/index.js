const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// Temporary in-memory storage (will be replaced with database later)
const users = []
const posts = []

const resolvers = {
  Query: {
    posts: async () => {
      console.log("[v0] Fetching all posts")
      return posts
    },

    post: async (_, { id }) => {
      console.log("[v0] Fetching post with id:", id)
      return posts.find((post) => post.id === id) || null
    },

    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }
      console.log("[v0] Fetching current user")
      const user = users.find((u) => u.id === context.user.userId)
      return user || null
    },
  },

  Mutation: {
    register: async (_, { username, email, password }) => {
      console.log("[v0] Registering user:", email)

      // Check if user exists
      const existingUser = users.find((u) => u.email === email)
      if (existingUser) {
        throw new Error("User already exists")
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = {
        id: `user-${Date.now()}`,
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      }
      users.push(user)

      console.log("[v0] Created user with ID:", user.id)
      console.log("[v0] Total users in array:", users.length)

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      }
    },

    login: async (_, { email, password }) => {
      console.log("[v0] Login attempt for:", email)

      // Find user
      const user = users.find((u) => u.email === email)
      if (!user) {
        throw new Error("Invalid credentials")
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error("Invalid credentials")
      }

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      }
    },

    createPost: async (_, { title, content }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      console.log("Creating post:", title)
      console.log("Context user:", context.user)
      console.log("Looking for user ID:", context.user.userId)
      console.log(
        "Users in array:",
        users.map((u) => ({ id: u.id, username: u.username })),
      )

      // Find author
      const author = users.find((u) => u.id === context.user.userId)

      if (!author) {
        console.log("ERROR: User not found in users array!")
        throw new Error("User not found")
      }

      console.log("Found author:", author.username)

      // Create post
      const post = {
        id: `post-${Date.now()}`,
        title,
        content,
        author: {
          id: author.id,
          username: author.username,
          email: author.email,
          createdAt: author.createdAt,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      posts.push(post)

      return post
    },

    updatePost: async (_, { id, title, content }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      console.log("[v0] Updating post:", id)

      const postIndex = posts.findIndex((p) => p.id === id)
      if (postIndex === -1) {
        throw new Error("Post not found")
      }

      // Update post
      if (title) posts[postIndex].title = title
      if (content) posts[postIndex].content = content
      posts[postIndex].updatedAt = new Date().toISOString()

      return posts[postIndex]
    },

    deletePost: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      console.log("[Deleting post:", id)

      const postIndex = posts.findIndex((p) => p.id === id)
      if (postIndex === -1) {
        throw new Error("Post not found")
      }

      posts.splice(postIndex, 1)
      return true
    },
  },
}

module.exports = resolvers
