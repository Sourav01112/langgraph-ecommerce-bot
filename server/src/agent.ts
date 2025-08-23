import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages"
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts"
import { StateGraph } from "@langchain/langgraph"
import { Annotation } from "@langchain/langgraph"
import { tool } from "@langchain/core/tools"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb"
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import { MongoClient } from "mongodb"   
import {retry_backoff} from "./utils/helper"
import { z } from "zod"
import "dotenv/config"


export async function callAgent(client: MongoClient, query: string, thread_id: string) {
  try {
    const dbName = "ecommerce-bot"
    const db = client.db(dbName)
    const collection = db.collection("items")

    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    })

    const itemLookupTool = tool(
      async ({ query, n = 10 }) => {
        try {
          console.log("Construction materials lookup tool called with query:", query)

          const totalCount = await collection.countDocuments()
          console.log(`Total documents in collection: ${totalCount}`)

          if (totalCount === 0) {
            console.log("Collection is empty")
            return JSON.stringify({ 
              error: "No materials found in inventory", 
              message: "The construction materials inventory database appears to be empty",
              count: 0 
            })
          }

          const sampleDocs = await collection.find({}).limit(3).toArray()
          console.log("Sample construction materials:", sampleDocs.map(doc => ({
            name: doc.item_name,
            category: doc.categories?.[0],
            brand: doc.brand
          })))

          const dbConfig = {
            collection: collection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          }

          const vectorStore = new MongoDBAtlasVectorSearch(
            new GoogleGenerativeAIEmbeddings({
              apiKey: process.env.GOOGLE_API_KEY,
              model: "text-embedding-004",
            }),
            dbConfig
          )

          console.log("Performing vector search for construction materials...")
          const result = await vectorStore.similaritySearchWithScore(query, n)
          console.log(`Vector search returned ${result.length} construction material results`)
          
          if (result.length === 0) {
            console.log("Vector search returned no results, trying text search for materials...")
            const textResults = await collection.find({
              $or: [
                { item_name: { $regex: query, $options: 'i' } },
                { item_description: { $regex: query, $options: 'i' } },
                { categories: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { embedding_text: { $regex: query, $options: 'i' } }
              ]
            }).limit(n).toArray()
            
            console.log(`Text search returned ${textResults.length} material results`)
            return JSON.stringify({
              results: textResults,
              searchType: "text",
              query: query,
              count: textResults.length
            })
          }

          return JSON.stringify({
            results: result,
            searchType: "vector",
            query: query,
            count: result.length
          })
          
        } catch (error: any) {
          console.error("Error in construction materials lookup:", error)
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
          
          return JSON.stringify({ 
            error: "Failed to search construction materials inventory", 
            details: error.message,
            query: query
          })
        }
      },
      {
        name: "construction_materials_lookup",
        description: "Searches construction materials and raw materials inventory including steel, concrete, lumber, roofing, plumbing, electrical supplies, hardware, and specialty construction products. Returns detailed product information with specifications, pricing, and availability.",
        schema: z.object({
          query: z.string().describe("The search query for construction materials (e.g., 'steel rebar', 'concrete blocks', 'lumber 2x4', 'roofing materials')"),
          n: z.number().optional().default(10)
            .describe("Number of construction material results to return"),
        }),
      }
    )

    const tools = [itemLookupTool]
    const toolNode = new ToolNode<typeof GraphState.State>(tools)

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0,
      maxRetries: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    }).bindTools(tools)

    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages
      const lastMessage = messages[messages.length - 1] as AIMessage

      if (lastMessage.tool_calls?.length) {
        return "tools"
      }
      return "__end__"
    }

    async function callModel(state: typeof GraphState.State) {
      return retry_backoff(async () => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            `You are a knowledgeable Construction Materials E-commerce Specialist and expert assistant for a construction supplies store. You help contractors, builders, architects, and DIY customers find the right materials for their projects.

EXPERTISE: You have deep knowledge of:
- Steel products (rebar, structural steel, sheets, pipes, fasteners)
- Concrete materials (cement, aggregates, blocks, ready-mix)
- Lumber and wood products (dimensional lumber, plywood, engineered wood, treated materials)
- Roofing materials (metal sheets, shingles, tiles, membranes, underlayment)
- Masonry supplies (bricks, stones, mortar, blocks)
- Plumbing materials (pipes, fittings, valves, fixtures)
- Electrical supplies (conduits, cables, panels, hardware)
- Insulation and weatherproofing materials
- Hardware and fasteners for construction applications
- Specialty construction chemicals and sealants

IMPORTANT TOOL USAGE: You have access to a construction_materials_lookup tool that searches our comprehensive construction materials inventory database. ALWAYS use this tool when customers ask about:
- Specific materials or products
- Product availability and pricing
- Technical specifications
- Material recommendations for projects
- Comparisons between different products

RESPONSE GUIDELINES:
- If the tool returns results: Provide detailed information about the materials including specifications, applications, pricing, and suitability for the customer's project
- If the tool returns no results: Acknowledge this professionally and offer alternative suggestions or ask for more specific requirements
- If the database appears empty: Inform the customer that inventory is being updated and offer to help with general construction material guidance
- Always consider the customer's specific project requirements, budget, and timeline
- Provide technical advice on material selection, compatibility, and installation considerations
- Mention relevant building codes or standards when applicable

COMMUNICATION STYLE:
- Professional but approachable
- Use construction industry terminology appropriately
- Ask clarifying questions about project scope, load requirements, environmental conditions, etc.
- Provide practical installation tips and best practices
- Consider safety requirements and building codes

Current time: {time}`,
          ],
          new MessagesPlaceholder("messages"),
        ])

        const formattedPrompt = await prompt.formatMessages({
          time: new Date().toISOString(),
          messages: state.messages,
        })

        const result = await model.invoke(formattedPrompt)
        return { messages: [result] }
      })
    }

    const workflow = new StateGraph(GraphState)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent")

    const checkpointer = new MongoDBSaver({ client, dbName })
    const app = workflow.compile({ checkpointer })

    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(query)],
      },
      { 
        recursionLimit: 15,
        configurable: { thread_id: thread_id }
      }
    )

    const response = finalState.messages[finalState.messages.length - 1].content
    console.log("Construction materials agent response:", response)

    return response

  } catch (error: any) {
    console.error("Error in construction materials agent:", error.message)
    
    if (error.status === 429) {
      throw new Error("Service temporarily unavailable due to rate limits. Please try again in a minute.")
    } else if (error.status === 401) {
      throw new Error("Authentication failed. Please check your API configuration.")
    } else {
      throw new Error(`Construction materials agent failed: ${error.message}`)
    }
  }
}