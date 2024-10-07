import express from 'express';
import axios from 'axios';
import Token from '../models/Token.js';
import { setupWebhookAfterOAuth } from './webhook.js'; // Import the webhook setup function

const router = express.Router();

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(`https://github.com/login/oauth/access_token`, {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: "application/json" }
    });

    const accessToken = response.data.access_token;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubId = userResponse.data.id;
    let tokenRecord = await Token.findOne({ githubId });

    if (tokenRecord) {
      tokenRecord.accessToken = accessToken;
      await tokenRecord.save();
    } else {
      tokenRecord = new Token({ githubId, accessToken });
      await tokenRecord.save();
    }

    // Setup webhook after successfully saving the token
    await setupWebhookAfterOAuth(githubId, accessToken);

    res.send(`GitHub OAuth successful! Token saved.`);
  } catch (error) {
    console.error("Error during GitHub OAuth callback:", error);
    res.status(500).send("Error during GitHub OAuth callback");
  }
});

export default router;
