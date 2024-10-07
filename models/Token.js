// models/Token.js
import mongoose from 'mongoose';

// Define the schema for storing tokens
const tokenSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true // Ensure each user has a unique token stored
  },
  accessToken: {
    type: String,
    required: true
  }
});


const Token = mongoose.model('Token', tokenSchema);
export default Token;
