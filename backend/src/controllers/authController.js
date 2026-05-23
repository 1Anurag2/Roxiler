const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const crypto = require("crypto");

const validatePassword = (password) => {
  const re = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
  return re.test(password);
};

const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || name.length < 5 || name.length > 60) {
      return res.status(400).json({
        error: "Name must be between 5 and 60 characters",
      });
    }

    if (!address || address.length > 400) {
      return res.status(400).json({
        error: "Address max 400 chars",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: "Invalid email",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must contain uppercase and special char",
      });
    }

    const [existing] = await db.execute("SELECT * FROM user WHERE email=?", [
      email,
    ]);

    if (existing.length) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const id = crypto.randomUUID();

    await db.execute(
      `
      INSERT INTO user
      (id,name,email,password,address,role)
      VALUES (?,?,?,?,?,?)
      `,
      [id, name, email, hashed, address, role || "NORMAL"],
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: id,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute("SELECT * FROM user WHERE email=?", [
      email,
    ]);

    if (!rows.length) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
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
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// UPDATE PASSWORD

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user.id;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Invalid password format",
      });
    }

    const [rows] = await db.execute("SELECT * FROM user WHERE id=?", [userId]);

    const user = rows[0];

    const ok = await bcrypt.compare(oldPassword, user.password);

    if (!ok) {
      return res.status(400).json({
        error: "Old password incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE user SET password=? WHERE id=?",

      [hashed, userId],
    );

    res.json({
      message: "Password updated",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
