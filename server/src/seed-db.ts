import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import "dotenv/config"
import { generate_mock_data } from "./utils/helper"
import { client, setup_db_collections, create_vector_search_idx, connectToDatabase, disconnectFromDatabase } from "./atlas/db"
import { Item } from "./utils/types"

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",  
  temperature: 0.7,               
  apiKey: process.env.GOOGLE_API_KEY, 
})

async function create_summary_items(item: Item): Promise<string> {
  return new Promise((resolve) => {
    const manufacturerDetails = `Made in ${item.manufacturer_address.country}`
    const categories = item.categories.join(", ")
    const userReviews = item.user_reviews
      .map(
        (review: any) =>
          `Rated ${review.rating} on ${review.review_date}: ${review.comment}`
      )
      .join(" ")
    const basicInfo = `${item.item_name} ${item.item_description} from the brand ${item.brand}`
    const price = `At full price it costs: ${item.prices.full_price} USD, On sale it costs: ${item.prices.sale_price} USD`
    const notes = item.notes
    const summary = `${basicInfo}. Manufacturer: ${manufacturerDetails}. Categories: ${categories}. Reviews: ${userReviews}. Price: ${price}. Notes: ${notes}`
    resolve(summary)
  })
}

async function seedDB(): Promise<void> {
  try {
    console.log("Starting database seeding process...")
    
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set")
    }
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set")
    }
    
    console.log("Environment variables loaded")
    
    await connectToDatabase()
    
    await setup_db_collections()
    await create_vector_search_idx()
    
    const db = client.db("ecommerce-bot")
    const collection = db.collection("items")
    
    const deleteResult = await collection.deleteMany({})
    console.log(`Cleared ${deleteResult.deletedCount} existing records from items collection`)
    
    console.log("Generating synthetic data...")
    const syntheticData = await generate_mock_data()
    console.log(`Generated ${syntheticData.length} items`)
    
    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await create_summary_items(record),
        metadata: { ...record },
      }))
    )
    
    console.log("Processing and saving records...")
    let processedCount = 0
    
    for (const record of recordsWithSummaries) {
      try {
        await MongoDBAtlasVectorSearch.fromDocuments(
          [record],
          new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "text-embedding-004",
          }),
          {
            collection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          }
        )
        processedCount++
        console.log(`Successfully processed record ${processedCount}/${recordsWithSummaries.length}: ${record.metadata.item_id}`)
      } catch (error) {
        console.error(`Failed to process record ${record.metadata.item_id}:`, error)
      }
    }
    
    console.log(`🎉 Database seeding completed! Processed ${processedCount}/${recordsWithSummaries.length} records`)
  } catch (error) {
    console.error("💥 Error seeding database:", error)
    throw error
  } finally {
    await disconnectFromDatabase()
  }
}

if (require.main === module) {
  seedDB().catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}
