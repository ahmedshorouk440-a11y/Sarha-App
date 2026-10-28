
import nodemailer from "nodemailer"
import { BadRequestExption } from "../Excption/Excption.js"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.App_Password,
  },
})

export const sendemail = async ({ to, subject, html }) => {
  try {
    if (!to?.length) throw new BadRequestExption("missing email recipients");
if (!html?.length) throw new BadRequestExption("missing email content");
  
    const info = await transporter.sendMail({
      from: `"${process.env.APPLICATION_NAME}" <${process.env.APP_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.log("Error while sending mail:", error)
    throw error
  }
}