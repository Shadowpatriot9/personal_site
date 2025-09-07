export default async function handler(req, res) {
  console.log('\n' + '='.repeat(50));
  console.log('📧 CONTACT FORM API CALLED');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('='.repeat(50));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message, useAI } = req.body;

  // Input validation
  if (!name || !email || !message) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Invalid email format');
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  console.log('📝 Contact form submission:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Subject:', subject || '(no subject)');
  console.log('Message length:', message.length);
  console.log('AI response requested:', useAI);

  try {
    // For now, we'll just log the message and provide a response
    // In production, you'd integrate with an email service like Resend, SendGrid, etc.
    
    let aiResponse = null;
    
    // Generate AI response if requested
    if (useAI && process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Generating AI response...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are Grayden Scovil's AI assistant responding to contact form messages. Be friendly, professional, and helpful. Keep responses concise but informative. Mention that this is an automated response and Grayden will also respond personally soon.`
              },
              {
                role: 'user',
                content: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'No subject'}\nMessage: ${message}`
              }
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices[0].message.content;
          console.log('✅ AI response generated');
        } else {
          console.log('⚠️ AI response failed, continuing without it');
        }
      } catch (aiError) {
        console.error('❌ AI response error:', aiError.message);
        // Continue without AI response
      }
    }

    // Create response object
    const result = {
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.',
      timestamp: new Date().toISOString(),
      aiResponse: aiResponse || (useAI ? 'Thanks for reaching out! This is an automated acknowledgment. Grayden will respond personally within 24 hours. Looking forward to connecting with you!' : null)
    };

    console.log('✅ Contact form processed successfully');
    console.log('AI response included:', !!aiResponse);

    res.status(200).json(result);

    // In production, you would also:
    // 1. Send email to your actual email address
    // 2. Send confirmation email to the user
    // 3. Store the message in a database
    // 4. Send notification (Slack, Discord, etc.)

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Sorry, there was an error sending your message. Please try emailing me directly at gscovil9@gmail.com' 
    });
  }
}
