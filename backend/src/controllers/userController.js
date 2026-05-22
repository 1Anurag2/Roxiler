const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const stores = await prisma.store.findMany({
      include: {
        ratings: true
      }
    });

    const formattedStores = stores.map(store => {
      let overallRating = 0;
      let userRating = null;

      if (store.ratings.length > 0) {
        const sum = store.ratings.reduce((a, b) => a + b.score, 0);
        overallRating = sum / store.ratings.length;
      }

      const userRatingObj = store.ratings.find(r => r.userId === userId);
      if (userRatingObj) {
        userRating = userRatingObj.score;
      }

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating,
        userRating
      };
    });

    res.json(formattedStores);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, score } = req.body;

    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Score must be between 1 and 5' });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: { userId, storeId }
      }
    });

    if (existingRating) {
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score }
      });
    } else {
      await prisma.rating.create({
        data: { score, userId, storeId }
      });
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
