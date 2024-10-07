import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';
import connectDB from './config/db.js'; // Import the connectDB function

dotenv.config();

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
connectDB(); // Call the connectDB function to establish the connection

app.use('/auth', authRoutes); // OAuth routes
app.use('/webhook', webhookRoutes); // Webhook routes

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
