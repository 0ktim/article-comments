// index.js

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const app = express()

// Serve your static front-end from /public
app.use(express.static(path.join(__dirname, 'public')))

// Parse JSON bodies on POST requests
app.use(express.json())

// MongoDB connection
const mongoUri = process.env.MONGO_URL
if (!mongoUri) {
  console.error('❌ Missing MongoDB connection string in env vars')
  process.exit(1)
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

// Define a Comment schema + model
const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
)

const Comment = mongoose.model('Comment', commentSchema)

// GET /api/comments
//   returns all comments sorted by newest first
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 })
    res.json(comments)
  } catch (err) {
    console.error('Error fetching comments:', err)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// POST /api/comments
//   accepts { name, text } in JSON body and creates a new comment
app.post('/api/comments', async (req, res) => {
  const { name, text } = req.body
  if (!name || !text) {
    return res.status(400).json({ error: 'Name and text are required' })
  }

  try {
    const newComment = new Comment({ name, text })
    await newComment.save()
    res.status(201).json(newComment)
  } catch (err) {
    console.error('Error saving comment:', err)
    res.status(500).json({ error: 'Failed to save comment' })
  }
})

// Fallback: serve index.html for any other route (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`)
})
