const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'NORMAL' } });
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // Basic filter & sort can be handled on the frontend for simplicity, 
    // or passed as query params. We will return all and let the client filter/sort.
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['NORMAL', 'ADMIN', 'STORE_OWNER'] }
      },
      select: {
        id: true, name: true, email: true, address: true, role: true,
        ratings: { select: { score: true } },
        ownedStores: { select: { ratings: { select: { score: true } } } }
      }
    });

    // Formatting store owner ratings
    const formattedUsers = users.map(user => {
      let rating = null;
      if (user.role === 'STORE_OWNER' && user.ownedStores.length > 0) {
        const storeRatings = user.ownedStores[0].ratings;
        if (storeRatings.length > 0) {
          const sum = storeRatings.reduce((a, b) => a + b.score, 0);
          rating = sum / storeRatings.length;
        }
      }
      return { ...user, rating, ratings: undefined, ownedStores: undefined };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        ratings: { select: { score: true } }
      }
    });

    const formattedStores = stores.map(store => {
      let rating = 0;
      if (store.ratings.length > 0) {
        const sum = store.ratings.reduce((a, b) => a + b.score, 0);
        rating = sum / store.ratings.length;
      }
      return { id: store.id, name: store.name, email: store.email, address: store.address, rating };
    });

    res.json(formattedStores);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addUser = async (req, res) => {
  // Similar to register, but restricted to admin
  try {
    const { name, email, password, address, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, address, role },
    });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const store = await prisma.store.create({
      data: { name, email, address, ownerId }
    });
    res.status(201).json({ message: 'Store created', storeId: store.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
