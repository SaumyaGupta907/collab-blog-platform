console.log("[v0] Starting server initialization...")

const express = require("express")
const { ApolloServer } = require("apollo-server-express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()

console.log("Dependencies loaded successfully")

const typeDefs = require("./schema/typeDefs")
const resolvers = require("./resolvers")

console.log("Schema and resolvers loaded")

// Create Express app
const app = express()

// Middleware
app.use(cors())
// Apollo Server handles body parsing internally
// Having both causes "stream is not readable" error because the request body gets consumed twice

const getUser = (token) => {
  try {
    if (token) {
      // Remove "Bearer " prefix if present
      const cleanToken = token.replace("Bearer ", "")
      // Verify and decode the JWT token
      return jwt.verify(cleanToken, process.env.JWT_SECRET || "your-secret-key")
    }
    return null
  } catch (error) {
    console.log("Token verification failed:", error.message)
    return null
  }
}

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Context function runs on every request
  context: ({ req }) => {
    // Get token from Authorization header
    const token = req.headers.authorization || ""
    // Decode token to get user info
    const user = getUser(token)
    // Return context object (available to all resolvers)
    return { user }
  },
})

// Start server
async function startServer() {
  console.log("Starting Apollo Server...")

  try {
    await server.start()
    console.log("Apollo Server started")

    server.applyMiddleware({ app })
    console.log("Middleware applied")

    const PORT = process.env.PORT || 4000

    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
      console.log(`📊 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`)
    })
  } catch (error) {
    console.error("Error in startServer:", error)
    throw error
  }
}

console.log("Calling startServer()...")

startServer().catch((error) => {
  console.error(" Error starting server:", error)
  process.exit(1)
})
