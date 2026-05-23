const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Store fetch

    const [stores] = await db.execute(
      `
SELECT
id,
name

FROM store

WHERE ownerId=?

LIMIT 1
`,

      [ownerId],
    );

    if (!stores.length) {
      return res.status(404).json({
        error: "Store not found",
      });
    }

    const store = stores[0];

    // Ratings + user

    const [ratings] = await db.execute(
      `

SELECT

r.score,

u.id
AS userId,

u.name

FROM rating r

JOIN user u

ON u.id=r.userId

WHERE r.storeId=?

`,

      [store.id],
    );

    // Average

    let averageRating = 0;

    if (ratings.length) {
      averageRating = ratings.reduce((a, b) => a + b.score, 0) / ratings.length;
    }

    // Format

    const user = ratings.map((r) => ({
      userId: r.userId,

      name: r.name,

      score: r.score,
    }));

    res.json({
      storeName: store.name,

      averageRating,

      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
