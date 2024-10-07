import express from 'express';
import axios from 'axios';
import Token from '../models/Token.js';
import { analyzeCode } from '../config/gemini.js'; // Import the Gemini analysis function

const router = express.Router();

// Function to create a webhook
const createWebhook = async (repoOwner, repoName, accessToken) => {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`,
      {
        name: 'web',
        active: true,
        events: ['pull_request'],
        config: {
          url: `https://automatic-github-pr-review-system.vercel.app/webhook`,  // The webhook URL on your server
          content_type: 'json',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    console.log('Webhook created successfully:', response.data);
  } catch (error) {
    console.error('Error creating webhook:', error);
  }
};

// Function to fetch files changed in the PR
const getPRFiles = async (prUrl, accessToken) => {
  try {
    const response = await axios.get(prUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Replace with user's token
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data.files; // Return the files that were changed in the PR
  } catch (error) {
    console.error('Error fetching PR files:', error);
    return [];
  }
};

// Function to get access token for a specific user based on their GitHub ID
const getAccessTokenForUser = async (githubId) => {
  const tokenRecord = await Token.findOne({ githubId });
  return tokenRecord ? tokenRecord.accessToken : null;
};

// Function to analyze code using Google Gemini
const analyzeCodeWithGemini = async (filesChanged) => {
  const codeToAnalyze = filesChanged.map(file => file.patch).join('\n'); // Combine code from changed files
  try {
    const response = await analyzeCode(codeToAnalyze); // Use the imported analyzeCode function
    return response; // Return the analysis result
  } catch (error) {
    console.error('Error analyzing code with Gemini:', error);
    return 'Code analysis failed.';
  }
};

router.post('/', express.json(), async (req, res) => {
  const event = req.headers['x-github-event'];

  if (event === 'pull_request' && req.body.action === 'opened') {
    const pullRequest = req.body.pull_request;
    console.log(`New Pull Request Created: ${pullRequest.title}`);
    console.log(`Pull Request URL: ${pullRequest.html_url}`);

    // Fetch the access token for the user who opened the PR
    const accessToken = await getAccessTokenForUser(req.body.sender.id); // Retrieve the user's token

    // Fetch the files changed in the PR
    const filesChanged = await getPRFiles(pullRequest.url, accessToken);

    // Analyze the code using Google Gemini
    const analysisResult = await analyzeCodeWithGemini(filesChanged);

    // Post the analysis results as a comment on the PR
    await postCommentOnPR(pullRequest.comments_url, analysisResult, accessToken);
  }

  res.status(200).send('Webhook received');
});

// Function to post a comment on the PR
const postCommentOnPR = async (commentsUrl, comment, accessToken) => {
  try {
    await axios.post(commentsUrl, { body: comment }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    console.log('Comment posted on PR');
  } catch (error) {
    console.error('Error posting comment:', error);
  }
};

// Function to be called after OAuth token retrieval to create the webhook
const setupWebhookAfterOAuth = async (githubId, accessToken) => {
  const repoOwner = 'Java-Developer24'; // Replace with your repository owner's GitHub username
  const repoName = 'Ebook-Library-Admin-Dashboard-ReactJS'; // Replace with your repository name
  await createWebhook(repoOwner, repoName, accessToken);
};

export { setupWebhookAfterOAuth }; // Export the function
export default router;


