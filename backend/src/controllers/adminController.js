const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// DASHBOARD

exports.getDashboardStats = async (req, res) => {
  try {
    const [[users]] = await db.execute(
      `
        SELECT COUNT(*) total
        FROM user
        WHERE role='NORMAL'
        `,
    );

    const [[stores]] = await db.execute(
      `
        SELECT COUNT(*) total
        FROM store
        `,
    );

    const [[ratings]] = await db.execute(
      `
        SELECT COUNT(*) total
        FROM rating
        `,
    );

    res.json({
      totalUsers: users.total,
      totalStores: stores.total,
      totalRatings: ratings.total,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// GET USERS

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      `
        SELECT

        u.id,
        u.name,
        u.email,
        u.address,
        u.role,

        AVG(r.score)
        AS rating

        FROM user u

        LEFT JOIN store s
        ON s.ownerId=u.id

        LEFT JOIN rating r
        ON r.storeId=s.id

        GROUP BY u.id
        `,
    );

    res.json(users);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// GET STORES

exports.getStores = async (req, res) => {
  try {
    const [stores] = await db.execute(
      `
        SELECT

        s.id,
        s.name,
        s.email,
        s.address,

        AVG(r.score)
        AS rating

        FROM store s

        LEFT JOIN rating r
        ON r.storeId=s.id

        GROUP BY s.id
        `,
    );

    res.json(stores);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ADD USER

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const id = crypto.randomUUID();

    await db.execute(
      `
      INSERT INTO user
      (
        id,
        name,
        email,
        password,
        address,
        role
      )
      VALUES
      (?,?,?,?,?,?)
      `,

      [id, name, email, hashed, address, role],
    );

    res.status(201).json({
      message: "User created",

      userId: id,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ADD STORE

exports.addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const id = crypto.randomUUID();

    await db.execute(
      `
      INSERT INTO store
      (
        id,
        name,
        email,
        address,
        ownerId
      )
      VALUES
      (?,?,?,?,?)
      `,

      [id, name, email, address, ownerId],
    );

    res.status(201).json({
      message: "Store created",

      storeId: id,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
