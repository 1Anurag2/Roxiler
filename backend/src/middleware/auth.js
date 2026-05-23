const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,

      process.env.JWT_SECRET,
    );

    // DB se user fetch

    const [rows] = await db.execute(
      `

SELECT

id,
name,
email,
role

FROM user

WHERE id=?

LIMIT 1

`,

      [decoded.id],
    );

    if (!rows.length) {
      return res.status(401).json({
        error: "User not found.",
      });
    }

    req.user = rows[0];

    next();
  } catch (err) {
    console.log(err);

    res.status(400).json({
      error: "Invalid token.",
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,

  authorize,
};
