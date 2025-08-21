import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, secure, user, pass } = body;

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
    } else if (error.message?.includes('Invalid login')) {
      errorMessage += 'Invalid credentials. For Gmail, use an App Password. For SendGrid, use "apikey" as username.';
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