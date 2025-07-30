 const express = require('express');
  const axios = require('axios');
  const path = require('path');
  const cors = require('cors');

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(express.static('public'));

  // Serve the main form
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Handle form submission
  app.post('/generate-leads', async (req, res) => {
    const { customer_url, customer_name } = req.body;

    try {
      console.log(`Processing: ${customer_name} - ${customer_url}`);

      // Send to Make.com webhook
      const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

      if (!makeWebhookUrl) {
        throw new Error('Make.com webhook URL not configured');
      }

      const response = await axios.post(makeWebhookUrl, {
        customer_url: customer_url,
        customer_name: customer_name,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: `Lead generation started for ${customer_name}`,
        batch_id: response.data?.batch_id || 'Processing...'
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start lead generation',
        error: error.message
      });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'Lead Generator UI is running' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Lead Generator UI running on port ${PORT}`);
    console.log(`📝 Access the form at: http://localhost:${PORT}`);
  });
