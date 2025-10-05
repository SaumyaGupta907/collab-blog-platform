const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { Pool } = require("pg")

// Database connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const resolvers = {
  Query: {
    // Fetch all blog posts with author information
    posts: async () => {
      const result = await pool.query(`
        SELECT 
          p.id, p.title, p.content, p.created_at, p.updated_at,
          u.id as author_id, u.username, u.email, u.created_at as author_created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
      `)

      return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: {
          id: row.author_id,
          username: row.username,
          email: row.email,
          createdAt: row.author_created_at,
        },
      }))
    },

    // Fetch a single post by ID
    post: async (_, { id }) => {
      const result = await pool.query(
        `
        SELECT 
          p.id, p.title, p.content, p.created_at, p.updated_at,
          u.id as author_id, u.username, u.email, u.created_at as author_created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = $1
      `,
        [id],
      )

      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: {
          id: row.author_id,
          username: row.username,
          email: row.email,
          createdAt: row.author_created_at,
        },
      }
    },

    // Get currently authenticated user
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      const result = await pool.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [
        context.user.userId,
      ])

      if (result.rows.length === 0) return null

      const user = result.rows[0]
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      }
    },
  },

  Mutation: {
    // Register a new user
    register: async (_, { username, email, password }) => {
      // Check if user already exists
      const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])

      if (existingUser.rows.length > 0) {
        throw new Error("User already exists")
      }

      // Hash password for security
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert new user into database
      const result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
        [username, email, hashedPassword],
      )

      const user = result.rows[0]

      // Generate JWT token for authentication
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at,
        },
      }
    },

    // Login existing user
    login: async (_, { email, password }) => {
      // Find user by email
      const result = await pool.query("SELECT id, username, email, password, created_at FROM users WHERE email = $1", [
        email,
      ])

      if (result.rows.length === 0) {
        throw new Error("Invalid credentials")
      }

      const user = result.rows[0]

      // Verify password
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error("Invalid credentials")
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at,
        },
      }
    },

    // Create a new blog post
    createPost: async (_, { title, content }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      // Insert post into database
      const postResult = await pool.query(
        "INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING id, title, content, author_id, created_at, updated_at",
        [title, content, context.user.userId],
      )

      const post = postResult.rows[0]

      // Fetch author information
      const authorResult = await pool.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [
        post.author_id,
      ])

      const author = authorResult.rows[0]

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: {
          id: author.id,
          username: author.username,
          email: author.email,
          createdAt: author.created_at,
        },
      }
    },

    // Update an existing post
    updatePost: async (_, { id, title, content }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      // Check if post exists and belongs to user
      const checkResult = await pool.query("SELECT author_id FROM posts WHERE id = $1", [id])

      if (checkResult.rows.length === 0) {
        throw new Error("Post not found")
      }

      if (checkResult.rows[0].author_id !== context.user.userId) {
        throw new Error("Not authorized to update this post")
      }

      // Build dynamic update query based on provided fields
      const updates = []
      const values = []
      let paramCount = 1

      if (title) {
        updates.push(`title = $${paramCount}`)
        values.push(title)
        paramCount++
      }

      if (content) {
        updates.push(`content = $${paramCount}`)
        values.push(content)
        paramCount++
      }

      updates.push(`updated_at = NOW()`)
      values.push(id)

      // Update post in database
      const result = await pool.query(
        `
        UPDATE posts 
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING id, title, content, author_id, created_at, updated_at
      `,
        values,
      )

      const post = result.rows[0]

      // Fetch author information
      const authorResult = await pool.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [
        post.author_id,
      ])

      const author = authorResult.rows[0]

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: {
          id: author.id,
          username: author.username,
          email: author.email,
          createdAt: author.created_at,
        },
      }
    },

    // Delete a post
    deletePost: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      // Check if post exists and belongs to user
      const checkResult = await pool.query("SELECT author_id FROM posts WHERE id = $1", [id])

      if (checkResult.rows.length === 0) {
        throw new Error("Post not found")
      }

      if (checkResult.rows[0].author_id !== context.user.userId) {
        throw new Error("Not authorized to delete this post")
      }

      // Delete post from database
      await pool.query("DELETE FROM posts WHERE id = $1", [id])

      return true
    },
  },
}

module.exports = resolvers
