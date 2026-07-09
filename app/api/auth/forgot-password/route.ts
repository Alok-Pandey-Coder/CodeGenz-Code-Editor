
import { NextResponse , NextRequest} from "next/server";
import { db } from "@/lib/db";
import { resetPasswordToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const {email} = await req.json();

  const existingUser = await db.user.findUnique({
    where: {
      email,
    }
  })

  if (!existingUser) {
    return NextResponse.json({ success: "If that email exists, a reset link has been sent." });
  }

  const passwordResetToken = await resetPasswordToken(email);
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

  return NextResponse.json({success: "If that email exists, a reset link has been sent." })

}