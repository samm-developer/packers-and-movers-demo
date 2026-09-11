import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rajat:aaaaaaaa@cluster0.nboeygl.mongodb.net/clone1?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Mongoose Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Database: clone1)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Mongoose Schemas & Models
const quoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  shiftingDetails: { type: String, default: 'General Shifting' },
  city: { type: String, default: 'Bangalore' },
  source: { type: String, default: 'Website Form' },
  createdAt: { type: Date, default: Date.now }
});

const adInquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  businessName: { type: String, default: '' },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const QuoteRequest = mongoose.model('QuoteRequest', quoteSchema);
const AdInquiry = mongoose.model('AdInquiry', adInquirySchema);

// API Routes
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    databaseStatus: statusMap[state] || 'unknown',
    databaseName: mongoose.connection.name || 'clone1'
  });
});

// Submit Shifting Quote Request
app.post('/api/quotes', async (req, res) => {
  try {
    const { name, mobile, shiftingDetails, city, source } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const newQuote = new QuoteRequest({
      name: name || 'Valued Customer',
      mobile,
      shiftingDetails: shiftingDetails || 'Home Shifting',
      city: city || 'Bangalore',
      source: source || 'Website Hero Form'
    });

    const saved = await newQuote.save();
    console.log('📥 Saved New Quote Request to MongoDB:', saved._id);
    res.status(201).json({
      success: true,
      message: 'Quote request saved successfully to MongoDB Atlas!',
      data: saved
    });
  } catch (err) {
    console.error('Error saving quote request:', err);
    res.status(500).json({ error: 'Internal Server Error while saving quote' });
  }
});

// Retrieve Quote Requests
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await QuoteRequest.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Submit Business Advertisement Inquiry
app.post('/api/ad-inquiry', async (req, res) => {
  try {
    const { name, email, mobile, businessName, message } = req.body;
    if (!email && !mobile) {
      return res.status(400).json({ error: 'Contact email or phone is required' });
    }

    const newInquiry = new AdInquiry({
      name: name || 'Business Partner',
      email: email || '',
      mobile: mobile || '',
      businessName: businessName || '',
      message: message || ''
    });

    const saved = await newInquiry.save();
    console.log('📢 Saved New Ad Inquiry to MongoDB:', saved._id);
    res.status(201).json({
      success: true,
      message: 'Advertisement inquiry saved successfully to MongoDB!',
      data: saved
    });
  } catch (err) {
    console.error('Error saving ad inquiry:', err);
    res.status(500).json({ error: 'Failed to submit advertising inquiry' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sheetal.net Backend API Server running on port ${PORT}`);
});
