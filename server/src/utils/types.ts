import { z } from "zod"
import { StructuredOutputParser } from "@langchain/core/output_parsers"



export const itemSchema = z.object({
  item_id: z.string(),                    
  item_name: z.string(),                  
  item_description: z.string(),           
  brand: z.string(),                     
  manufacturer_address: z.object({        
    street: z.string(),                   
    city: z.string(),                     
    state: z.string(),                    
    postal_code: z.string(),             
    country: z.string(),                  
  }),
  prices: z.object({                     
    full_price: z.number(),              
    sale_price: z.number(),              
  }),
  categories: z.array(z.string()),        
  user_reviews: z.array(                 
    z.object({
      review_date: z.string(),           
      rating: z.number(),                
      comment: z.string(),                
    })
  ),
  notes: z.string(),                    
})


export type Item = z.infer<typeof itemSchema>
export const parser = StructuredOutputParser.fromZodSchema(z.array(itemSchema))


