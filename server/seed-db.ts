import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import "dotenv/config"
import { generate_mock_data } from "./utils/helper"
import { client, setup_db_collections, create_vector_search_idx } from "./atlas/db"
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
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    console.log("successfully connected to MongoDB!...")
    await setup_db_collections()
    await create_vector_search_idx()
    const db = client.db("inventory_database")
    const collection = db.collection("items")
    await collection.deleteMany({})
    console.log("Cleared existing data from items collection")
    const syntheticData = await generate_mock_data()
    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await create_summary_items(record),
        metadata: { ...record },
      }))
    )
    for (const record of recordsWithSummaries) {
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
      console.log("Successfully processed & saved record:", record.metadata.item_id)
    }
    console.log("Database seeding completed")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDB().catch(console.error)
