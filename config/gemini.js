import axios from 'axios';

const GEMINI_API_URL = 'https://gemini-api-url.com'; // Replace with the actual API URL
const API_KEY = process.env.GEMINI_API_KEY; // Ensure your API key is stored in .env

// Function to analyze code using Google Gemini
export const analyzeCode = async (code) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}/analyze`, // Adjust this endpoint based on Gemini API documentation
      {
        code, // The code you want to analyze
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // Process the response as needed
  } catch (error) {
    console.error('Error analyzing code with Gemini:', error);
    throw error; // Re-throw error for handling in the calling function
  }
};
