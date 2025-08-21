import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';
import { domainService } from '@/lib/db';
import { validateRequest, createDomainSchema } from '@/lib/validation';
import crypto from 'crypto';

// Get all domains
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    logApiUsage(auth.apiKey, '/api/domains', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const domains = await domainService.getAll();
    
    // Add DNS records for each domain
    const domainsWithRecords = domains.map(domain => ({
      ...domain,
      dnsRecords: generateDNSRecords(domain.name)
    }));
    
    logApiUsage(auth.apiKey, '/api/domains', true);
    return NextResponse.json(domainsWithRecords);
  } catch (error) {
    console.error('Failed to get domains:', error);
    logApiUsage(auth.apiKey, '/api/domains', false);
    return NextResponse.json({ error: 'Failed to retrieve domains' }, { status: 500 });
  }
}

// Create new domain
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    logApiUsage(auth.apiKey, '/api/domains', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = validateRequest(createDomainSchema, body);
    
    const domain = await domainService.create(data.name);
    const dnsRecords = generateDNSRecords(data.name);
    
    logApiUsage(auth.apiKey, '/api/domains', true);
    
    return NextResponse.json({
      success: true,
      message: 'Domain created successfully',
      domain: {
        ...domain,
        dnsRecords
      }
    });
  } catch (error: any) {
    console.error('Failed to create domain:', error);
    logApiUsage(auth.apiKey, '/api/domains', false);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
  }
}

// Verify domain DNS records
export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    logApiUsage(auth.apiKey, '/api/domains', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;
    
    if (!id || !action) {
      return NextResponse.json({ error: 'Domain ID and action are required' }, { status: 400 });
    }
    
    if (action === 'verify') {
      // In production, this would actually check DNS records
      // For now, we'll simulate verification
      const verificationResults = await verifyDNSRecords(id);
      
      const domain = await domainService.verify(id, verificationResults);
      
      logApiUsage(auth.apiKey, '/api/domains', true);
      
      return NextResponse.json({
        success: true,
        message: 'Domain verification completed',
        domain,
        verificationResults
      });
    } else if (action === 'delete') {
      const success = await domainService.delete(id);
      
      if (!success) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
      }
      
      logApiUsage(auth.apiKey, '/api/domains', true);
      
      return NextResponse.json({
        success: true,
        message: 'Domain deleted successfully'
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to update domain:', error);
    logApiUsage(auth.apiKey, '/api/domains', false);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

// Generate DNS records for a domain
function generateDNSRecords(domain: string) {
  const dkimSelector = 'mail';
  const dkimPublicKey = crypto.randomBytes(32).toString('base64');
  
  return {
    spf: {
      type: 'TXT',
      name: domain,
      value: `v=spf1 include:_spf.${process.env.FROM_EMAIL?.split('@')[1] || 'example.com'} ~all`,
      description: 'SPF record to authorize email sending'
    },
    dkim: {
      type: 'TXT',
      name: `${dkimSelector}._domainkey.${domain}`,
      value: `v=DKIM1; k=rsa; p=${dkimPublicKey}`,
      description: 'DKIM record for email authentication'
    },
    dmarc: {
      type: 'TXT',
      name: `_dmarc.${domain}`,
      value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; fo=1;`,
      description: 'DMARC policy for email authentication'
    },
    mx: {
      type: 'MX',
      name: domain,
      value: `10 mail.${domain}`,
      description: 'Mail server record (if hosting your own mail server)'
    },
    domainVerification: {
      type: 'TXT',
      name: `_mail-verification.${domain}`,
      value: `mail-verify=${crypto.randomBytes(16).toString('hex')}`,
      description: 'Domain ownership verification'
    }
  };
}

// Simulate DNS verification (in production, use dns.resolve)
async function verifyDNSRecords(domainId: string): Promise<{ spf: boolean; dkim: boolean; dmarc: boolean }> {
  // In production, you would use dns.resolveTxt() to check actual DNS records
  // For now, we'll simulate with random success
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  return {
    spf: Math.random() > 0.3,
    dkim: Math.random() > 0.3,
    dmarc: Math.random() > 0.3
  };
}