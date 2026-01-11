import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    const { message, pageUrl } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Insert feedback into database
    const { error: dbError } = await supabase.from("feedback").insert({
      user_id: user?.id,
      email: user?.email,
      message: message.trim(),
      page_url: pageUrl,
    });

    if (dbError) {
      console.error("Failed to save feedback:", dbError);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    // Send email notification
    const notificationEmail = process.env.FEEDBACK_NOTIFICATION_EMAIL;
    if (resend && notificationEmail) {
      try {
        await resend.emails.send({
          from: "Yalla Flash <noreply@yallaflash.app>",
          to: notificationEmail,
          subject: "New feedback received",
          html: `
            <h2>New feedback from ${user?.email || "Anonymous"}</h2>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; margin-left: 0;">
              ${message.trim().replace(/\n/g, "<br>")}
            </blockquote>
            <p><strong>Page:</strong> ${pageUrl || "N/A"}</p>
            <p><strong>User ID:</strong> ${user?.id || "Not logged in"}</p>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error("Failed to send notification email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
