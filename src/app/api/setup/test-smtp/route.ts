import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  let smtpConfig: any;
  
  try {
    const body = await request.json();
    const { host, port, secure, user, pass } = body;
    smtpConfig = { host, port, secure, user }; // Store for error handling

    // Validate required fields
    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        { error: 'Missing required SMTP configuration' },
        { status: 400 }
      );
    }

    // Create transporter with provided settings
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure,
      auth: {
        user,
        pass
      },
      // Additional settings for better compatibility
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Verify connection
    await transporter.verify();

    return NextResponse.json(
      { 
        success: true, 
        message: 'SMTP connection successful' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('SMTP test error:', error);

    // Provide helpful error messages
    let errorMessage = 'Failed to connect to SMTP server. ';
    
    if (error.code === 'EAUTH') {
      errorMessage += 'Authentication failed. Please check your username and password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage += 'Could not connect to server. Please check the host and port.';
    } else if (error.code === 'ESOCKET') {
      errorMessage += 'Connection timeout. The server may be unreachable.';
    } else if (error.message?.includes('Invalid login') || error.message?.includes('Username and Password not accepted')) {
      // Provide specific guidance based on the SMTP host
      if (smtpConfig?.host?.includes('gmail.com')) {
        errorMessage = '❌ Gmail Authentication Failed\n\n';
        errorMessage += '📱 Gmail requires an App Password, not your regular password.\n\n';
        errorMessage += 'Follow these steps:\n';
        errorMessage += '1. Go to https://myaccount.google.com/apppasswords\n';
        errorMessage += '2. Sign in to your Google account\n';
        errorMessage += '3. Select "Mail" as the app\n';
        errorMessage += '4. Copy the 16-character password\n';
        errorMessage += '5. Paste it here instead of your regular password\n\n';
        errorMessage += '⚠️ Note: You must have 2-Factor Authentication enabled first.';
      } else if (smtpConfig?.host?.includes('sendgrid')) {
        errorMessage += 'Invalid SendGrid credentials. Use "apikey" as username and your API key as password.';
      } else if (smtpConfig?.host?.includes('outlook.com') || smtpConfig?.host?.includes('office365.com')) {
        errorMessage += 'Invalid Outlook/Office 365 credentials. If you have 2FA enabled, you may need an app password.';
      } else {
        errorMessage += 'Invalid credentials. Please check your username and password.';
      }
    } else if (error.message?.includes('self signed certificate')) {
      errorMessage += 'SSL certificate issue. This is common with local mail servers.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}