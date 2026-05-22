const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: { user: true }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    let averageRating = 0;
    if (store.ratings.length > 0) {
      const sum = store.ratings.reduce((a, b) => a + b.score, 0);
      averageRating = sum / store.ratings.length;
    }

    const usersSubmittedRatings = store.ratings.map(r => ({
      userId: r.user.id,
      name: r.user.name,
      score: r.score
    }));

    res.json({
      storeName: store.name,
      averageRating,
      users: usersSubmittedRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
