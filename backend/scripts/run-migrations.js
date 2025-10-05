// `pg` - PostgreSQL client library to connect to your database
//`fs` - File system module to read SQL files
//`path` - Module to handle file paths

const { Client } = require("pg")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  })

  try {
    console.log("Connecting to database...")
    await client.connect()
    console.log("Connected successfully!")

    const sqlFile = path.join(__dirname, "001_create_tables.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")

    console.log("Running migration: 001_create_tables.sql")
    await client.query(sql)
    console.log("Migration completed successfully!")
    console.log("Tables created: users, posts")
  } catch (error) {
    console.error("Migration failed:", error.message)
    process.exit(1)
  } finally {
    await client.end()
    console.log("Database connection closed")
  }
}

runMigrations()
