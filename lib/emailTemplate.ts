// lib/emailTemplate.ts

export const getNewsletterTemplate = (content: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Newsletter Dunkly</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f6f6f6; padding-bottom: 40px; }
          .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #333333; }
          .header { background-color: #ff6600; padding: 20px; text-align: center; color: white; }
          .content { padding: 30px; font-size: 16px; line-height: 1.5; }
          .footer { background-color: #333333; color: #ffffff; text-align: center; padding: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <center class="wrapper">
          <table class="main" width="100%">
            <tr>
              <td class="header">
                <h1 style="margin:0;">DUNKLY</h1>
              </td>
            </tr>
            <tr>
              <td class="content">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p>Dunkly App &copy; 2026</p>
              </td>
            </tr>
          </table>
        </center>
      </body>
      </html>
    `;
  };