import {v4 as uuidv4} from "uuid"
import { db } from "./db"

export const resetPasswordToken = async(email:string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000);
  const existingToken = await db.passwordResetToken.findFirst({
    where: {
      email,
    }
  })

  if(existingToken) {
    await db.passwordResetToken.delete({
      where: {
        id: existingToken?.id
      }
    })
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      token,
      email,
      expires,
    }
  })

  return passwordResetToken;
}