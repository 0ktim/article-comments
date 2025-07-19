require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Свързване към MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Схема и модел за коментари
const commentSchema = new mongoose.Schema({
  name: String,
  text: String
}, { timestamps: true });
const Comment = mongoose.model('Comment', commentSchema);

// POST /api/comments – добави коментар
app.post('/api/comments', async (req, res) => {
  try {
    const c = new Comment(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/comments – вземи списъка
app.get('/api/comments', async (req, res) => {
  try {
    const list = await Comment.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Стартирай сървъра
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
