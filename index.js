// index.js
require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const path     = require('path')

const app = express()

// 1) Serve статиката (frontend-a ти в папка /public)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

// 2) Свързване с MongoDB
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

// 3) Define Mongoose schema + model
const commentSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  text:    { type: String, required: true },
  created: { type: Date,   default: Date.now }
})
const Comment = mongoose.model('Comment', commentSchema)

// 4) API роути
//   - Прочитане на всички коментари
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ created: -1 })
    res.json(comments)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

//   - Публикуване на нов коментар
app.post('/api/comments', async (req, res) => {
  const { name, text } = req.body
  if (!name || !text) {
    return res.status(400).json({ error: 'Both name and text are required' })
  }
  try {
    const comment = new Comment({ name, text })
    await comment.save()
    res.status(201).json(comment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not save comment' })
  }
})

// 5) SPA fallback (★ поправено от '*' на '/*' ★)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// 6) Старт на сървъра
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`)
})
