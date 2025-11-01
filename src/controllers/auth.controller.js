const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
const { Op } = require("sequelize");
let twilio;
let client;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilio = require("twilio");
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.log("Twilio not configured. OTP functionality will be limited.");
}

exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Get customer role
    const role = await Role.findOne({
      where: { name: "CUSTOMER" },
    });

    if (!role) {
      return res.status(400).json({ message: "Customer role not found" });
    }

    // Create customer user
    const user = await User.create({
      name,
      email,
      phone,
      password: null, // Customers don't use password
      roleId: role.id,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: role.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!user || user.role.name !== "ADMIN") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({
      where: { phone },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!user || user.role.name !== "CUSTOMER") {
      return res
        .status(404)
        .json({ message: "User not found or not a customer" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to user
    user.otpSecret = bcrypt.hashSync(otp.toString(), 8);
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via Twilio if configured, otherwise log it (for testing/development)
    if (client && process.env.NODE_ENV === "production") {
      try {
        await client.messages.create({
          body: `Your OTP for login is: ${otp}`,
          to: phone,
          from: process.env.TWILIO_PHONE_NUMBER,
        });
      } catch (error) {
        console.error("Twilio error:", error);
        // Still save OTP but notify about SMS failure
        console.log(
          `Failed to send SMS. Development mode - OTP for ${phone}: ${otp}`
        );
      }
    } else {
      // For testing/development, just log the OTP
      console.log(`Development mode - OTP for ${phone}: ${otp}`);
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({
      where: { phone },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!user || user.role.name !== "CUSTOMER") {
      return res
        .status(404)
        .json({ message: "User not found or not a customer" });
    }

    if (!user.otpSecret || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (!user.otpSecret || !user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "No OTP was sent. Please request a new OTP." });
    }

    const isValidOTP = bcrypt.compareSync(otp.toString(), user.otpSecret);
    if (!isValidOTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(401).json({ message: "OTP has expired" });
    }

    // Clear OTP
    user.otpSecret = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
