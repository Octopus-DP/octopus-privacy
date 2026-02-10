// Mailjet Email Helper for Phishing Campaigns
// Uses Mailjet API v3.1 for sending emails

interface EmailRecipient {
  Email: string;
  Name: string;
}

interface EmailData {
  from: {
    email: string;
    name: string;
  };
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  customId?: string;
}

/**
 * Send email via Mailjet API
 */
export async function sendEmailViaMailjet(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = Deno.env.get('MAILJET_API_KEY');
    const apiSecret = Deno.env.get('MAILJET_SECRET_KEY');

    console.log('[MAILJET] Checking credentials...');
    if (!apiKey || !apiSecret) {
      const error = 'Mailjet API credentials not configured';
      console.error(`[MAILJET] ${error}`);
      throw new Error(error);
    }
    console.log('[MAILJET] Credentials OK');

    // Mailjet API v3.1 endpoint
    const url = 'https://api.mailjet.com/v3.1/send';

    // Prepare Mailjet request body
    const mailjetBody = {
      Messages: [
        {
          From: {
            Email: emailData.from.email,
            Name: emailData.from.name,
          },
          To: emailData.to,
          Subject: emailData.subject,
          TextPart: emailData.textContent || '',
          HTMLPart: emailData.htmlContent,
          CustomID: emailData.customId || '',
        },
      ],
    };

    console.log('[MAILJET] Sending email via Mailjet API...');
    console.log(`[MAILJET] From: ${emailData.from.name} <${emailData.from.email}>`);
    console.log(`[MAILJET] To: ${emailData.to.map(t => `${t.Name} <${t.Email}>`).join(', ')}`);
    console.log(`[MAILJET] Subject: ${emailData.subject}`);

    // Basic Auth with Mailjet credentials
    const credentials = btoa(`${apiKey}:${apiSecret}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(mailjetBody),
    });

    console.log(`[MAILJET] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MAILJET] API error response:', response.status, errorText);
      throw new Error(`Mailjet API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[MAILJET] API response:', JSON.stringify(result, null, 2));
    
    if (result.Messages && result.Messages[0] && result.Messages[0].Status === 'success') {
      console.log('[MAILJET] ✅ Email sent successfully!');
      return {
        success: true,
        messageId: result.Messages[0].To[0].MessageID.toString(),
      };
    } else {
      const errorMsg = result.Messages?.[0]?.Errors?.[0]?.ErrorMessage || 'Unknown error';
      console.error(`[MAILJET] ❌ Email sending failed: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error('[MAILJET] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Replace variables in email content
 */
export function replaceEmailVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  
  // Replace {{variable}} with actual values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Generate tracking pixel URL
 */
export function generateTrackingPixelUrl(baseUrl: string, campaignId: string, recipientId: string): string {
  return `${baseUrl}/functions/v1/make-server-abb8d15d/phishing/track/open/${campaignId}/${recipientId}`;
}

/**
 * Generate tracking link URL
 */
export function generateTrackingLinkUrl(baseUrl: string, campaignId: string, recipientId: string): string {
  return `${baseUrl}/functions/v1/make-server-abb8d15d/phishing/track/click/${campaignId}/${recipientId}`;
}

/**
 * Insert tracking pixel into HTML content
 */
export function insertTrackingPixel(htmlContent: string, trackingPixelUrl: string): string {
  // Insert tracking pixel just before closing body tag
  const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
  
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', `${trackingPixel}</body>`);
  } else {
    // If no body tag, append at the end
    return htmlContent + trackingPixel;
  }
}

/**
 * Replace {{tracking_link}} with actual tracking URL
 */
export function insertTrackingLink(htmlContent: string, trackingLinkUrl: string): string {
  return htmlContent.replace(/\{\{\s*tracking_link\s*\}\}/g, trackingLinkUrl);
}

/**
 * Generate random values for templates
 */
export function generateRandomValues(): Record<string, string> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const randomAmount = Math.floor(Math.random() * 500) + 50;
  
  const today = new Date();
  const deadline = new Date(today);
  deadline.setDate(deadline.getDate() + 2);
  
  return {
    random: randomNumber.toString(),
    amount: randomAmount.toString(),
    date: today.toLocaleDateString('fr-FR'),
    deadline: deadline.toLocaleDateString('fr-FR'),
  };
}

/**
 * Prepare email content for a phishing campaign
 */
export function preparePhishingEmail(
  template: any,
  campaign: any,
  recipient: any,
  baseUrl: string,
  campaignId: string,
  recipientId: string
): { subject: string; htmlContent: string; textContent: string } {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || baseUrl;
  
  console.log(`[TRACKING URLS] Base URL: ${baseUrl}`);
  console.log(`[TRACKING URLS] Supabase URL: ${supabaseUrl}`);
  
  // Generate tracking URLs
  const trackingPixelUrl = generateTrackingPixelUrl(supabaseUrl, campaignId, recipientId);
  const trackingLinkUrl = generateTrackingLinkUrl(supabaseUrl, campaignId, recipientId);
  
  console.log(`[TRACKING URLS] Pixel URL: ${trackingPixelUrl}`);
  console.log(`[TRACKING URLS] Link URL: ${trackingLinkUrl}`);
  
  // Generate random values
  const randomValues = generateRandomValues();
  
  // Extract company domain from recipient email
  const recipientDomain = recipient.email?.split('@')[1] || 'example.com';
  
  // Prepare variables for replacement
  const variables: Record<string, string> = {
    'Prénom': recipient.name?.split(' ')[0] || 'Collaborateur',
    'Nom': recipient.name?.split(' ').slice(1).join(' ') || '',
    'Nom_entreprise': campaign.clientName || 'Votre entreprise',
    'CEO_Name': 'Direction',
    'company_domain': recipientDomain,
    ...randomValues,
  };
  
  // Replace variables in subject
  let subject = replaceEmailVariables(template.subject, variables);
  
  // Replace variables in HTML content
  let htmlContent = replaceEmailVariables(template.htmlContent, variables);
  
  // Insert tracking link
  htmlContent = insertTrackingLink(htmlContent, trackingLinkUrl);
  
  // Insert tracking pixel
  htmlContent = insertTrackingPixel(htmlContent, trackingPixelUrl);
  
  console.log(`[TRACKING URLS] HTML snippet with tracking (first 500 chars):`);
  console.log(htmlContent.substring(0, 500));
  console.log(`[TRACKING URLS] HTML contains pixel URL: ${htmlContent.includes(trackingPixelUrl)}`);
  console.log(`[TRACKING URLS] HTML contains link URL: ${htmlContent.includes(trackingLinkUrl)}`);
  
  // Replace variables in text content
  let textContent = template.textContent || '';
  textContent = replaceEmailVariables(textContent, variables);
  textContent = insertTrackingLink(textContent, trackingLinkUrl);
  
  return {
    subject,
    htmlContent,
    textContent,
  };
}

/**
 * Send phishing email to a single recipient
 */
export async function sendPhishingEmail(
  template: any,
  campaign: any,
  recipient: any,
  baseUrl: string,
  campaignId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[PHISHING EMAIL] Preparing email for ${recipient.email} (ID: ${recipientId})`);
    
    // Prepare variables for replacement (same as in preparePhishingEmail)
    const randomValues = generateRandomValues();
    
    // Extract company domain from recipient email
    const recipientDomain = recipient.email?.split('@')[1] || 'example.com';
    
    const variables: Record<string, string> = {
      'Prénom': recipient.name?.split(' ')[0] || 'Collaborateur',
      'Nom': recipient.name?.split(' ').slice(1).join(' ') || '',
      'Nom_entreprise': campaign.clientName || 'Votre entreprise',
      'CEO_Name': 'Direction',
      'company_domain': recipientDomain,
      ...randomValues,
    };
    
    // Prepare email content
    const { subject, htmlContent, textContent } = preparePhishingEmail(
      template,
      campaign,
      recipient,
      baseUrl,
      campaignId,
      recipientId
    );
    
    console.log(`[PHISHING EMAIL] Email prepared - Subject: "${subject}"`);
    
    // Get sender info from template or use defaults, and replace variables
    let senderName = template.senderName || 'Service IT';
    let senderEmail = template.senderEmail || 'noreply@phishing-test.local';
    
    // Replace variables in sender name and email
    senderName = replaceEmailVariables(senderName, variables);
    senderEmail = replaceEmailVariables(senderEmail, variables);
    
    // Validate sender email (check if there are still unreplaced variables)
    if (senderEmail.includes('{{') || senderEmail.includes('}}')) {
      console.error(`[PHISHING EMAIL] Sender email still contains variables: ${senderEmail}`);
      return {
        success: false,
        error: `Sender email contains unreplaced variables: ${senderEmail}. Please configure a valid sender email in the template.`,
      };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      console.error(`[PHISHING EMAIL] Invalid sender email format: ${senderEmail}`);
      return {
        success: false,
        error: `Invalid sender email format: ${senderEmail}. Please configure a valid sender email in the template.`,
      };
    }
    
    console.log(`[PHISHING EMAIL] Sender: ${senderName} <${senderEmail}>`);
    console.log(`[PHISHING EMAIL] Recipient: ${recipient.name || recipient.email} <${recipient.email}>`);
    
    // Send via Mailjet
    const result = await sendEmailViaMailjet({
      from: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          Email: recipient.email,
          Name: recipient.name || recipient.email,
        },
      ],
      subject,
      htmlContent,
      textContent,
      customId: `phishing_${campaignId}_${recipientId}`,
    });
    
    console.log(`[PHISHING EMAIL] Mailjet result for ${recipient.email}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result.success) {
      console.error(`[PHISHING EMAIL] Error details: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error(`[PHISHING EMAIL] Exception sending to ${recipient.email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send batch of phishing emails with delay between each
 */
export async function sendPhishingEmailBatch(
  template: any,
  campaign: any,
  recipients: any[],
  baseUrl: string,
  campaignId: string,
  delayMs: number = 1000
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendPhishingEmail(
        template,
        campaign,
        recipient,
        baseUrl,
        campaignId,
        recipient.id
      );
      
      if (result.success) {
        sent++;
        console.log(`✓ Email sent to ${recipient.email}`);
      } else {
        failed++;
        const errorMsg = `Failed to send to ${recipient.email}: ${result.error}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
      
      // Delay between emails to avoid rate limiting
      if (delayMs > 0 && recipients.indexOf(recipient) < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      failed++;
      const errorMsg = `Error sending to ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`✗ ${errorMsg}`);
    }
  }
  
  return { sent, failed, errors };
}
