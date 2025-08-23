
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import { Item, parser } from "./types"
import { llm } from "../seed-db"


export async function generate_mock_data(): Promise<Item[]> {
  const prompt = `You are a super powerful and helpful assistant that generates construction materials and raw materials store item data. Generate 20 construction and raw materials items for building and construction projects. 

Include a diverse mix of materials such as:
- Steel products (rebar, beams, sheets, pipes, structural steel)
- Concrete materials (cement, aggregates, ready-mix concrete, concrete blocks)
- Wood materials (lumber, plywood, engineered wood, treated timber)
- Roofing materials (metal sheets, tiles, shingles, membranes)
- Insulation materials (fiberglass, foam, mineral wool)
- Piping and plumbing materials (PVC pipes, copper pipes, fittings)
- Electrical materials (conduits, cables, panels)
- Hardware and fasteners (bolts, screws, anchors, brackets)
- Masonry materials (bricks, stones, mortar, blocks)
- Specialty construction chemicals (sealants, adhesives, coatings)

Each record should include the following fields: item_id, item_name, item_description, brand, manufacturer_address, prices, categories, user_reviews, notes. 

Make sure to:
- Use realistic construction material brands and manufacturers
- Include technical specifications in descriptions (dimensions, grades, standards)
- Manufacturers should be located in major construction markets (e.g., any Indian city)
- Set appropriate price ranges for bulk construction materials
- Include relevant categories like "Steel & Metal", "Concrete & Masonry", "Lumber & Wood", "Roofing", "Plumbing", "Electrical", etc.
- Add realistic contractor and builder reviews mentioning durability, quality, delivery times
- Include technical notes about installation, compatibility, or safety requirements

Ensure variety in the data and realistic values for a construction materials supplier.
  ${parser.getFormatInstructions()}`
  
  console.log("Generating construction materials synthetic data...")
  const response = await llm.invoke(prompt)
  return parser.parse(response.content as string)
}



export async function retry_backoff<T>(
  fn: () => Promise<T>,   
  maxRetries = 3           
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()    
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
        console.log(`Rate limit hit. Retrying in ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue 
      }
      throw error 
    }
  }
  throw new Error("Max retries exceeded") 
}
