import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { supabaseService } from './src/supabase.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post('/webhook/invoices', async (req, res) => {
  try {
    const invoice = req.body // Assume payload matches schema
    const { data, error } = await supabaseService.from('invoices').insert(invoice).select()
    if (error) throw error
    res.status(200).json({ success: true, data })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`))
