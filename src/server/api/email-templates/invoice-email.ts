interface InvoiceEmailData {
  propertyName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  label: string | null;
  lineItems: Array<{
    categoryName: string;
    description: string | null;
    amount: number;
  }>;
  totalCharged: number;
  notes: string | null;
  paymentMethods?: Array<{ name: string; details: string }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildInvoiceEmailHtml(data: InvoiceEmailData): string {
  const lineItemRows = data.lineItems
    .map(
      (li) => `
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top;">
                    <p style="margin: 0; font-size: 15px; color: #1d1d1f; font-weight: 500; line-height: 1.4;">${li.categoryName}</p>
                    ${li.description ? `<p style="margin: 4px 0 0; font-size: 13px; color: #86868b; line-height: 1.4;">${li.description}</p>` : ""}
                  </td>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #1d1d1f; text-align: right; vertical-align: top; font-weight: 500; white-space: nowrap;">
                    ${formatCurrency(li.amount)}
                  </td>
                </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${data.propertyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto;">

          <!-- Spacer -->
          <tr><td style="height: 48px;"></td></tr>

          <!-- Logo / Brand -->
          <tr>
            <td style="padding: 0 24px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; background-color: #1d1d1f; border-radius: 12px; line-height: 44px; text-align: center;">
                <span style="color: #ffffff; font-size: 18px; font-weight: 700;">T</span>
              </div>
            </td>
          </tr>

          <tr><td style="height: 32px;"></td></tr>

          <!-- Title -->
          <tr>
            <td style="padding: 0 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; line-height: 1.2;">Invoice</h1>
            </td>
          </tr>

          <tr><td style="height: 8px;"></td></tr>

          <!-- Property Name -->
          <tr>
            <td style="padding: 0 24px; text-align: center;">
              <p style="margin: 0; font-size: 17px; color: #86868b; font-weight: 400; line-height: 1.4;">${data.propertyName}</p>
            </td>
          </tr>

          <tr><td style="height: 40px;"></td></tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background-color: #e8e8ed;"></div>
            </td>
          </tr>

          <tr><td style="height: 32px;"></td></tr>

          <!-- Billing Period -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #86868b; font-weight: 600;">Billing Period</p>
              <p style="margin: 8px 0 0; font-size: 17px; color: #1d1d1f; font-weight: 600; line-height: 1.4;">
                ${formatDate(data.billingPeriodStart)} &ndash; ${formatDate(data.billingPeriodEnd)}
              </p>
              ${data.label ? `<p style="margin: 4px 0 0; font-size: 15px; color: #6e6e73;">${data.label}</p>` : ""}
            </td>
          </tr>

          <tr><td style="height: 32px;"></td></tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background-color: #e8e8ed;"></div>
            </td>
          </tr>

          <tr><td style="height: 32px;"></td></tr>

          <!-- Line Items -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0 0 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #86868b; font-weight: 600;">Details</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${lineItemRows}
              </table>
            </td>
          </tr>

          <tr><td style="height: 24px;"></td></tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px 0 0; border-top: 2px solid #1d1d1f;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 17px; font-weight: 700; color: #1d1d1f;">Total Due</td>
                        <td style="font-size: 22px; font-weight: 700; color: #1d1d1f; text-align: right; letter-spacing: -0.01em;">${formatCurrency(data.totalCharged)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height: 40px;"></td></tr>

          ${
            data.notes
              ? `<!-- Notes -->
          <tr>
            <td style="padding: 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px 24px; background-color: #f5f5f7; border-radius: 12px;">
                    <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #86868b; font-weight: 600;">Notes</p>
                    <p style="margin: 0; font-size: 15px; color: #1d1d1f; line-height: 1.5;">${data.notes}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height: 40px;"></td></tr>`
              : ""
          }

          ${
            data.paymentMethods && data.paymentMethods.length > 0
              ? `<!-- Payment Methods -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #86868b; font-weight: 600;">Payment Methods</p>
              ${data.paymentMethods
                .map(
                  (
                    m,
                  ) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
                <tr><td style="padding: 14px 20px 4px; font-size: 14px; color: #1d1d1f; font-weight: 600;">${m.name}</td></tr>
                <tr><td style="padding: 0 20px 14px; font-size: 13px; color: #6e6e73; white-space: pre-wrap; line-height: 1.5;">${m.details}</td></tr>
              </table>`,
                )
                .join("")}
            </td>
          </tr>

          <tr><td style="height: 40px;"></td></tr>`
              : ""
          }

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background-color: #e8e8ed;"></div>
            </td>
          </tr>

          <tr><td style="height: 32px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #86868b; line-height: 1.6;">
                This is an automated invoice from <a href="https://tenantly.icu" style="color: #0071e3; text-decoration: none;">Tenantly</a>.<br>
                Please contact your property manager if you have any questions.
              </p>
            </td>
          </tr>

          <tr><td style="height: 48px;"></td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
