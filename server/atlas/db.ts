import { MongoClient } from "mongodb"
import "dotenv/config"




export const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string)

export async function setup_db_collections(): Promise<void> {
  console.log("Setting up database and collection...")
  
  const db = client.db("inventory_database")
  
  const collections = await db.listCollections({ name: "items" }).toArray()
  
  if (collections.length === 0) {
    await db.createCollection("items")
    console.log("Created 'items' collection in 'inventory_database' database")
  } else {
    console.log("'items' collection already exists in 'inventory_database' database")
  }
}


export async function create_vector_search_idx(): Promise<void> {
  try {
    const db = client.db("inventory_database")
    const collection = db.collection("items")
    await collection.dropIndexes()
    const vectorSearchIdx = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        "fields": [
          {
            "type": "vector",
            "path": "embedding",
            "numDimensions": 768,
            "similarity": "cosine"
          }
        ]
      }
    }
    console.log("Creating vector search index...")
    await collection.createSearchIndex(vectorSearchIdx);

    console.log("Successfully created vector search index");
  } catch (e) {
    console.error('Failed to create vector search index:', e);
  }
}
