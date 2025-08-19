import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      // .env.local file doesn't exist, return default template
      const examplePath = path.join(process.cwd(), '.env.example');
      try {
        envContent = await fs.readFile(examplePath, 'utf8');
      } catch {
        envContent = `# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name`;
      }
    }
    
    // Parse env content into key-value pairs
    const envVars: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return NextResponse.json({
      envVars,
      rawContent: envContent
    });
  } catch (error) {
    console.error('Failed to read config:', error);
    return NextResponse.json({ error: 'Failed to read configuration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { envVars } = await request.json();
    const envPath = path.join(process.cwd(), '.env.local');
    
    // Convert env vars back to .env format
    let envContent = '# SMTP Configuration (Required)\n';
    Object.entries(envVars).forEach(([key, value]) => {
      envContent += `${key}=${value}\n`;
    });
    
    await fs.writeFile(envPath, envContent, 'utf8');
    
    console.log('Configuration updated successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration saved. Restart server to apply changes.' 
    });
  } catch (error) {
    console.error('Failed to save config:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
