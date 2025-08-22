
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import { Item, parser } from "./types"
impor { llm } from "./seed-db"




export async function generate_mock_data(): Promise<Item[]> {
  const prompt = `You are a super powerful and helpful assistant that generates furniture store item data. Generate 20 furniture store items. Each record should include the following fields: item_id, item_name, item_description, brand, manufacturer_address, prices, categories, user_reviews, notes. Ensure variety in the data and realistic values.
  ${parser.getFormatInstructions()}`
  console.log("Generating synthetic data...")
  const response = await llm.invoke(prompt)
  return parser.parse(response.content as string)
}

