import 'dotenv/config'
import express from "express"
import { MongoClient } from "mongodb"
import { callAgent } from './src/agent'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI as string)

async function startServer() {
  try {
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    console.log("Connected to MongoDB successfully")

    app.get('/', (req, res) => {
      res.json({ 
        status: 'online',
        service: 'Construction Materials E-commerce Bot',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      })
    })

    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', database: 'connected' })
    })

    app.post('/chat', async (req, res) => {
      const { message } = req.body
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' })
      }

      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      try {
        const response = await callAgent(client, message, threadId)
        res.json({ threadId, response, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error('Chat error:', error.message)
        res.status(500).json({ 
          error: 'Failed to process message',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
    })

    app.post('/chat/:threadId', async (req, res) => {
      const { threadId } = req.params
      const { message } = req.body

      if (!message) {
        return res.status(400).json({ error: 'Message is required' })
      }

      if (!threadId || threadId.length < 5) {
        return res.status(400).json({ error: 'Valid thread ID is required' })
      }

      try {
        const response = await callAgent(client, message, threadId)
        res.json({ response, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error('Chat continuation error:', error.message)
        res.status(500).json({ 
          error: 'Failed to process message',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
    })

    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' })
    })

    app.use((error, req, res, next) => {
      console.error('Unhandled error:', error)
      res.status(500).json({ error: 'Internal server error' })
    })

    const PORT = process.env.PORT || 8000
    
    const server = app.listen(PORT, () => {
      console.log(`Construction Materials Bot API running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

    async function gracefulShutdown() {
      console.log('Shutting down gracefully...')
      server.close(() => {
        client.close().then(() => {
          console.log('Server and database connections closed')
          process.exit(0)
        })
      })
    }

  } catch (error) {
    console.error('Server startup error:', error.message)
    process.exit(1)
  }
}

startServer().catch(error => {
  console.error('Fatal startup error:', error)
  process.exit(1)
})