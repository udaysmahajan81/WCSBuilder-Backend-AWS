import express from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const router = express.Router();

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "udays.mahajan81@gmail.com",
    pass: "ueuv hssa dtex kyqp"
  }
});

router.post("/send-otp", async (req, res) => {

  try {

    const { email } = req.body;

    const otp =
      Math.floor(
        100000 + Math.random() * 900000
      ).toString();

    otpStore[email] = otp;

    console.log(
      `OTP for ${email}: ${otp}`
    );

    await transporter.sendMail({

      from:
        "udays.mahajan81@gmail.com",

      to: email,

      subject:
        "WCS Builder Login OTP",

      html: `
        <h2>WCS Builder</h2>
        <p>Your login OTP is:</p>
        <h1>${otp}</h1>
      `
    });

    res.json({
      success: true,
      message: "OTP Sent"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post("/verify-otp", (req, res) => {

  const { email, otp } = req.body;

  if (otpStore[email] !== otp) {

    return res.status(401).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  const token = jwt.sign(
    { email },
    "WCS_BUILDER_SECRET",
    { expiresIn: "7d" }
  );

  delete otpStore[email];

  res.json({
    success: true,
    token
  });
});

export default router;