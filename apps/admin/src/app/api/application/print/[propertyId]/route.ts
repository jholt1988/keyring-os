import { NextRequest,NextResponse } from 'next/server';

// PDF Rental Application Generator
// Returns HTML that can be printed to PDF

const generateApplicationHTML = (params: {
  propertyName?: string;
  unitNumber?: string;
  monthlyRent?: number;
}) => {
  const { propertyName = 'Riverside Apartments', unitNumber = '101', monthlyRent = 2200 } = params;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rental Application - ${propertyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1a1a1a;
      background: white;
      padding: 0.5in;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #3B82F6;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1e3a5f, #0f2744);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-icon svg {
      width: 24px;
      height: 24px;
      color: #38BDF8;
    }
    
    .logo-text {
      font-size: 18pt;
      font-weight: 700;
    }
    
    .logo-text span { color: #38BDF8; }
    
    .property-info {
      text-align: right;
    }
    
    .property-name {
      font-size: 14pt;
      font-weight: 600;
    }
    
    .property-details {
      font-size: 10pt;
      color: #666;
    }
    
    h2 {
      font-size: 12pt;
      font-weight: 600;
      margin: 20px 0 12px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-left: 3px solid #3B82F6;
    }
    
    .form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 12px;
    }
    
    .form-group {
      flex: 1;
    }
    
    label {
      display: block;
      font-size: 9pt;
      font-weight: 500;
      color: #444;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .field {
      border: 1px solid #ccc;
      padding: 6px 8px;
      min-height: 28px;
      font-size: 10pt;
    }
    
    .field-short { width: 80px; }
    .field-medium { width: 150px; }
    
    .two-columns { display: flex; gap: 30px; }
    .two-columns > div { flex: 1; }
    
    .section {
      margin-bottom: 20px;
    }
    
    .consent-box {
      margin-top: 25px;
      padding: 15px;
      border: 1px solid #ccc;
      background: #fafafa;
    }
    
    .consent-box label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      text-transform: none;
      font-weight: normal;
    }
    
    .checkbox {
      width: 14px;
      height: 14px;
      border: 1px solid #999;
    }
    
    .signature-section {
      display: flex;
      gap: 40px;
      margin-top: 30px;
    }
    
    .signature-block {
      flex: 1;
    }
    
    .signature-line {
      border-bottom: 1px solid #333;
      height: 35px;
      margin-bottom: 5px;
    }
    
    .signature-label {
      font-size: 9pt;
      color: #666;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #888;
      text-align: center;
    }
    
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div class="logo-text"><span>Keyring</span>OS</div>
    </div>
    <div class="property-info">
      <div class="property-name">${propertyName}</div>
      <div class="property-details">Unit ${unitNumber} • $${monthlyRent.toLocaleString()}/month</div>
    </div>
  </div>

  <h1 style="font-size: 16pt; margin-bottom: 5px;">Rental Application</h1>
  <p style="font-size: 10pt; color: #666; margin-bottom: 20px;">Please complete all sections and sign at the bottom.</p>

  <!-- PERSONAL INFORMATION -->
  <div class="section">
    <h2>Personal Information</h2>
    <div class="form-row">
      <div class="form-group">
        <label>First Name</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>Date of Birth</label>
        <div class="field field-medium"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Email Address</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>Phone Number</label>
        <div class="field field-medium"></div>
      </div>
    </div>
    <div class="form-group" style="margin-top: 12px;">
      <label>Current Address</label>
      <div class="field" style="width: 100%;"></div>
    </div>
    <div class="form-row" style="margin-top: 12px;">
      <div class="form-group">
        <label>City</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>State</label>
        <div class="field field-short"></div>
      </div>
      <div class="form-group">
        <label>ZIP Code</label>
        <div class="field field-short"></div>
      </div>
      <div class="form-group">
        <label>Years at Address</label>
        <div class="field field-short"></div>
      </div>
    </div>
  </div>

  <!-- EMPLOYMENT INFORMATION -->
  <div class="section">
    <h2>Employment Information</h2>
    <div class="form-row">
      <div class="form-group">
        <label>Current Employer</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <div class="field"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Employer Phone</label>
        <div class="field field-medium"></div>
      </div>
      <div class="form-group">
        <label>Years Employed</label>
        <div class="field field-short"></div>
      </div>
      <div class="form-group">
        <label>Monthly Income</label>
        <div class="field field-medium"></div>
      </div>
    </div>
  </div>

  <!-- RESIDENCY HISTORY -->
  <div class="section">
    <h2>Residency History</h2>
    <div class="two-columns">
      <div>
        <label>Current Landlord Name / Company</label>
        <div class="field"></div>
      </div>
      <div>
        <label>Landlord Phone</label>
        <div class="field field-medium"></div>
      </div>
    </div>
    <div style="margin-top: 12px;">
      <label>Reason for Moving</label>
      <div class="field" style="width: 100%;"></div>
    </div>
  </div>

  <!-- REFERENCES -->
  <div class="section">
    <h2>Personal References</h2>
    <div class="form-row">
      <div class="form-group">
        <label>Reference 1 - Full Name</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>Phone</label>
        <div class="field field-medium"></div>
      </div>
      <div class="form-group">
        <label>Relationship</label>
        <div class="field"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Reference 2 - Full Name</label>
        <div class="field"></div>
      </div>
      <div class="form-group">
        <label>Phone</label>
        <div class="field field-medium"></div>
      </div>
      <div class="form-group">
        <label>Relationship</label>
        <div class="field"></div>
      </div>
    </div>
  </div>

  <!-- MOVE-IN DETAILS -->
  <div class="section">
    <h2>Move-In Details</h2>
    <div class="form-row">
      <div class="form-group">
        <label>Desired Move-In Date</label>
        <div class="field field-medium"></div>
      </div>
      <div class="form-group">
        <label>Lease Term</label>
        <div class="field field-short"></div>
      </div>
      <div class="form-group">
        <label>Number of Occupants</label>
        <div class="field field-short"></div>
      </div>
    </div>
  </div>

  <!-- CONSENT & SIGNATURE -->
  <div class="consent-box">
    <label><span class="checkbox"></span> I authorize a credit and background check to be performed.</label>
    <label><span class="checkbox"></span> I certify that all information provided is true and accurate.</label>
    <label><span class="checkbox"></span> I authorize the landlord/property manager to verify all information.</label>
  </div>

  <div class="signature-section">
    <div class="signature-block">
      <label>Applicant Signature</label>
      <div class="signature-line"></div>
      <div class="signature-label">Date: ________________</div>
    </div>
    <div class="signature-block">
      <label>Co-Signer Signature (if applicable)</label>
      <div class="signature-line"></div>
      <div class="signature-label">Date: ________________</div>
    </div>
  </div>

  <div class="footer">
    <p>${propertyName} • Keyring OS Property Management • Generated: ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="padding: 10px 25px; font-size: 12pt; background: #3B82F6; color: white; border: none; border-radius: 5px; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>
</body>
</html>`;
};

export async function GET(
  request: NextRequest,
) {
  // Parse query params
  const { searchParams } = new URL(request.url);
  const propertyName = searchParams.get('property') || 'Riverside Apartments';
  const unitNumber = searchParams.get('unit') || '101';
  const monthlyRent = parseInt(searchParams.get('rent') || '2200', 10);

  const html = generateApplicationHTML({ propertyName, unitNumber, monthlyRent });

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST() {
  // Could handle form submission here
  return NextResponse.json({
    success: true,
    message: 'Application received',
    applicationId: `APP-${Date.now().toString(36).toUpperCase()}`,
  });
}
