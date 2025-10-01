const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const resolvers = {
    Query: {
        posts: async () => {
            // Fetch all blog posts from the database
            console.log("Fetching all blog posts");
            return []; 
        },

        post: async(_, {id}) => {
            // Fetch a single blog post by ID from the database
            console.log("Fetching blog post with ID:", id);
            return null; 
        },

        me: async (_, __, context) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        console.log('Fetching current user', user);
        return null;
    },
  },
    
  // Query Ends
  // Mutations for creating, updating, and deleting blog posts start here
    Mutation: {
        register: async(_, {username, email, password}) => { 

            console.log("Registering user:", email, username); 

            const hashedPassword = await bcrypt.hash(password, 10); 

            // Since we have to return a Authload type, we will create a temp token and user object

            const token = jwt.sign(
            { userId: 'temp-id' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

            const user = {
                id: 'temp-id',
                username,
                email,
                createdAt: new Date().toISOString(),
            }

        return {
            token,
            user
            }
        },

        login: async (_, { email, password }) => {
            console.log('Login attempt for:', email);

            const token = jwt.sign(
                { userId: 'temp-id' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return {
                token,
                user: {
                id: 'temp-id',
                username: 'Demo User',
                email,
                createdAt: new Date().toISOString(),
                },
            };
        },

        createPost: async (_, {title, content}, context) => {
            if (!context.user){
                throw new Error("Not Authenticated")
            }
            console.log("Creating Post Titled", title);

            const author = {
                id: context.user.id,
                username: 'Demo User',
                email: 'abc@gmail.com',
                createdAt: new Date().toISOString(),
            }

            const createPost = {
                id: 'temp-id',
                title,
                content,
                author,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            return {
                createPost,
            };
        },
        updatePost: async (_, { id, title, content }, context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }
            console.log('[v0] Updating post:', id);
            return null;
        },

        deletePost: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }
            console.log('[v0] Deleting post:', id);
            return true;
        },

    },

};

module.exports = resolvers;