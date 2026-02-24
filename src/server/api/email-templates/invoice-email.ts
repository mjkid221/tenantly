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
    month: "short",
    year: "numeric",
  });
}

export function buildInvoiceEmailHtml(data: InvoiceEmailData): string {
  const lineItemRows = data.lineItems
    .map(
      (li) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;">
            ${li.categoryName}${li.description ? `<br><span style="font-size: 12px; color: #6b7280;">${li.description}</span>` : ""}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right;">
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
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff;">Invoice</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1aa;">
                ${data.propertyName}
              </p>
            </td>
          </tr>

          <!-- Billing Period -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
                    <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 600;">Billing Period</p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #18181b; font-weight: 500;">
                      ${formatDate(data.billingPeriodStart)} &ndash; ${formatDate(data.billingPeriodEnd)}
                    </p>
                    ${data.label ? `<p style="margin: 4px 0 0; font-size: 14px; color: #52525b;">${data.label}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <th style="padding: 12px 16px; background-color: #f9fafb; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600; text-align: left; border-bottom: 1px solid #e5e7eb;">
                    Category
                  </th>
                  <th style="padding: 12px 16px; background-color: #f9fafb; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">
                    Amount
                  </th>
                </tr>
                ${lineItemRows}
                <tr>
                  <td style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #18181b;">
                    Total
                  </td>
                  <td style="padding: 14px 16px; font-size: 16px; font-weight: 700; color: #18181b; text-align: right;">
                    ${formatCurrency(data.totalCharged)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            data.notes
              ? `<!-- Notes -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 600;">Notes</p>
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">${data.notes}</p>
            </td>
          </tr>`
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated invoice notification. Please contact your property manager if you have any questions.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
