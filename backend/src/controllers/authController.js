const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const validatePassword = (password) => {
  const re = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
  return re.test(password);
};

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || name.length < 5 || name.length > 60) {
      return res
        .status(400)
        .json({ error: "Name must be between 5 and 60 characters." });
    }
    if (!address || address.length > 400) {
      return res
        .status(400)
        .json({ error: "Address must be max 400 characters." });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          "Password must be 8-16 characters, include 1 uppercase and 1 special character.",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "NORMAL"; // NORMAL is default

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role: userRole,
      },
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be 8-16 characters, include 1 uppercase and 1 special character.",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid old password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
