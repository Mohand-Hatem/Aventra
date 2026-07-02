import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/schemas/contact";
import { ContactEmail } from "@/components/emails/contact-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, website } = parsed.data;

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!process.env.CONTACT_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Contact email is not configured" },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "Aventra Contact <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Aventra Contact: ${subject}`,
      react: ContactEmail({
        name,
        email,
        subject,
        message,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("CONTACT_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}