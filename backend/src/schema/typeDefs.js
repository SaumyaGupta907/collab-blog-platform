const {gql} = require('apollo-server-express');

const typeDefs = gql`

    # Represents a blog author, defines what a user looks like
    type User {
        id: ID!
        username: String!
        email: String!
        createdAt: String!
    }

    # Represents a blog post, defines what a blog post looks like
    type BlogPost {
        id: ID!
        title: String!
        content: String!
        author: User!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        # Fetch all blog posts
        posts: [BlogPost!]!
        # Fetch a single blog post by ID
        post(id: ID!): BlogPost
        # Get current logged-in user
        me: User
    }

    # Payload returned after authentication (login/register)
    type AuthPayload {
        token: String!
        user: User!
    }

    # Mutations for creating, updating, and deleting blog posts
    type Mutation {
        # User registration
        register(username: String!, email: String!, password: String!): AuthPayload!
        # User login
        login(email: String!, password: String!): AuthPayload!

        # Create a new blog post
        createPost(title: String!, content: String!): BlogPost!
        # Update an existing blog post
        updatePost(id: ID!, title: String, content: String): BlogPost!
        # Delete a blog post
        deletePost(id: ID!): Boolean!
    }
`;
    module.exports = typeDefs; 

