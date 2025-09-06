import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'simple-jwt-secret-for-admin-2025';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  console.log('\n🛡️ CHATGPT API - TOKEN VERIFICATION');
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified for ChatGPT API');
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Invalid token for ChatGPT API');
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default async function handler(req, res) {
  console.log('\n' + '='.repeat(50));
  console.log('🤖 CHATGPT API CALLED');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('='.repeat(50));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  verifyToken(req, res, async () => {
    const { prompt } = req.body;

    if (!prompt) {
      console.log('❌ No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📝 Prompt received:', prompt.substring(0, 100) + '...');

    try {
      console.log('🚀 Making request to OpenAI API...');
      
      // Using OpenAI's free tier / gpt-3.5-turbo
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'demo-key'}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for Grayden Scovil\'s personal website admin panel.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.log('❌ OpenAI API error:', response.status);
        
        // Fallback response for demo/development
        const fallbackResponse = {
          response: `🤖 ChatGPT API Response (Demo Mode):\n\nYou asked: "${prompt}"\n\nThis is a demo response since the OpenAI API key is not configured. In production, this would connect to ChatGPT and provide real AI responses.\n\nTo enable real ChatGPT responses:\n1. Get an OpenAI API key\n2. Add OPENAI_API_KEY to Vercel environment variables\n3. Deploy the changes\n\nDemo features working:\n✅ Authentication\n✅ Request handling\n✅ Response formatting\n⚠️ Needs real API key for ChatGPT`,
          usage: {
            prompt_tokens: prompt.length / 4,
            completion_tokens: 150,
            total_tokens: (prompt.length / 4) + 150
          },
          model: 'demo-mode'
        };

        console.log('🔧 Returning fallback demo response');
        return res.status(200).json(fallbackResponse);
      }

      const data = await response.json();
      console.log('✅ OpenAI API response received');
      
      const result = {
        response: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };

      console.log('📤 Sending response to frontend');
      res.status(200).json(result);

    } catch (error) {
      console.error('❌ ChatGPT API Error:', error);
      
      // Fallback for any errors
      const errorResponse = {
        response: `🚨 Error connecting to ChatGPT API\n\nError: ${error.message}\n\nThis could be due to:\n- Missing or invalid OpenAI API key\n- Network connectivity issues\n- Rate limiting\n\nPlease check the server logs for more details.`,
        usage: { prompt_tokens: 0, completion_tokens: 50, total_tokens: 50 },
        model: 'error-fallback'
      };

      res.status(200).json(errorResponse);
    }
  });
}
