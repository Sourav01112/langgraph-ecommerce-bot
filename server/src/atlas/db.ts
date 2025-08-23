import { MongoClient } from "mongodb"
import "dotenv/config"

export const client = new MongoClient(process.env.MONGODB_URI as string)

let isConnected = false

export async function connectToDatabase(): Promise<void> {
  if (!isConnected) {
    try {
      await client.connect()
      await client.db("admin").command({ ping: 1 })
      console.log("Successfully connected to MongoDB!")
      isConnected = true
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error)
      throw error
    }
  }
}

export async function setup_db_collections(): Promise<void> {
  console.log("Setting up database and collection...")
  
  const db = client.db("ecommerce-bot")
  const collections = await db.listCollections({ name: "items" }).toArray()
  
  if (collections.length === 0) {
    await db.createCollection("items")
    console.log("Created 'items' collection in 'ecommerce-bot' database")
  } else {
    console.log("'items' collection already exists in 'ecommerce-bot' database")
  }
}

export async function create_vector_search_idx(): Promise<void> {
  try {
    const db = client.db("ecommerce-bot")
    const collection = db.collection("items")
    
    console.log("Creating vector search index...")
    
    const vectorSearchIdx = {
      name: "vector_index",
      definition: {
        "mappings": {
          "dynamic": true,
          "fields": {
            "embedding": {
              "type": "knnVector",
              "dimensions": 768,
              "similarity": "cosine"
            },
            "embedding_text": {
              "type": "string"
            }
          }
        }
      }
    }
    
    const existingIndexes = await collection.listSearchIndexes().toArray()
    const indexExists = existingIndexes.some(index => index.name === "vector_index")
    
    if (indexExists) {
      console.log("Vector search index 'vector_index' already exists")
      return
    }
    
    await collection.createSearchIndex(vectorSearchIdx)
    console.log("Successfully created vector search index")
    
    console.log("⏳ Waiting for index to initialize...")
    await new Promise(resolve => setTimeout(resolve, 10000))
    console.log("Index initialization complete")
    
  } catch (e) {
    console.error('Failed to create vector search index:', e)
    throw e
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (isConnected) {
    await client.close()
    isConnected = false
    console.log("Disconnected from MongoDB")
  }
}