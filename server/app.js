require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const ragRoutes = require('./routes/rag');
const costEstimateRoutes = require('./routes/costEstimate');
const lawyersRoutes = require('./routes/lawyers');
const complaintRoutes = require('./routes/complaint');
const lawStudentRoutes = require('./routes/lawStudent');
const legalAssistantRoutes = require('./routes/legalAssistant');
const specializedBotsRoutes = require('./routes/specializedBots');
const chatsRoutes = require('./routes/chats');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/jurismindDB")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PREVIEW,
  'http://localhost:5173'
].filter(Boolean);

app.set('trust proxy', 1);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api', costEstimateRoutes);
app.use('/api/lawyers', lawyersRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/law-student', lawStudentRoutes);
app.use('/api/legal-assistant', legalAssistantRoutes);
app.use('/api/specialized-bots', specializedBotsRoutes);
app.use('/api/chats', chatsRoutes);

app.get("/", function(req, res) {
  res.send("Legal Chatbot API Server");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Server is running on port ${PORT}`);
});
