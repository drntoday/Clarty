import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is missing. Transactional emails will be logged instead of sent.");
    return {
      emails: {
        send: async (options: any) => {
          console.log("📨 [Resend Log] Simulated transmission options:", options);
          return { data: { id: "simulated_resend_id_" + Math.random().toString(36).substring(7) }, error: null };
        },
      },
    } as unknown as Resend;
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export async function sendPerformanceAnomalyReport(email: string, reportContent: string) {
  const resend = getResendClient();
  try {
    const { data, error } = await resend.emails.send({
      from: "ClarityCommerce Alerts <alerts@claritycommerce.cc>",
      to: email,
      subject: "🚨 CRITICAL: ClarityCommerce Model Routing Budget/Anomaly Report",
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #9e1c1c; border-bottom: 1px solid #ddd; padding-bottom: 8px;">ClarityCommerce Commerce Intelligence Alert</h2>
          <p>This automated message has been routed based on your active routing configurations.</p>
          <div style="background: #f7f7f7; border: 1px solid #e1e1e1; padding: 15px; font-family: monospace; font-size: 13px; margin: 15px 0;">
            ${reportContent.replace(/\n/g, "<br>")}
          </div>
          <p style="font-size: 11px; color: #666; margin-top: 25px;">
            Configured dynamically by claritycommerce.cc built by nitishkumar.pro.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend failed to dispatch email:", error);
      return false;
    }
    return data;
  } catch (err) {
    console.error("❌ Exception during Resend execution:", err);
    return false;
  }
}
