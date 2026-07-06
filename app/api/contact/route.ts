import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'gscovil9@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

async function sendEmail(fields: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No email backend configured — accept the message without sending.
    return { sent: false };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: fields.email,
      subject: `Portfolio contact${fields.subject ? `: ${fields.subject}` : ''}`,
      text: `Name: ${fields.name}\nEmail: ${fields.email}\nSubject: ${fields.subject || '(none)'}\n\n${fields.message}`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend responded ${response.status}: ${detail}`);
  }

  return { sent: true };
}

export async function POST(request: Request) {
  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, subject, message } = body || {};

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: 'Name, email, and message are required' },
      { status: 400 },
    );
  }

  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid email address' },
      { status: 400 },
    );
  }

  try {
    await sendEmail({ name, email, subject, message });
    return NextResponse.json({
      success: true,
      message: "Thanks for reaching out — I'll get back to you soon.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Contact send error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'Sorry, something went wrong sending your message. Please email me directly at gscovil9@gmail.com.',
      },
      { status: 502 },
    );
  }
}
