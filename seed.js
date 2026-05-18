require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const seedProducts = [
    {
        name: 'Wireless Headphones',
        description: 'High-quality noise-canceling wireless headphones.',
        price: 199.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        category: 'Electronics',
        rating: 4.5,
        numReviews: 128
    },
    {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors.',
        price: 19.99,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
        category: 'Clothing',
        rating: 4.0,
        numReviews: 85
    },
    {
        name: 'Ceramic Coffee Mug',
        description: 'Handcrafted ceramic mug perfect for your morning brew.',
        price: 14.99,
        imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
        category: 'Home',
        rating: 4.8,
        numReviews: 42
    },
    {
        name: 'Smartphone',
        description: 'Latest model with advanced camera and battery life.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
        category: 'Electronics',
        rating: 4.7,
        numReviews: 320
    },
    {
        name: 'Running Shoes',
        description: 'Lightweight and durable running shoes for everyday use.',
        price: 89.99,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        category: 'Clothing',
        rating: 4.3,
        numReviews: 156
    },
    {
        name: 'Desk Lamp',
        description: 'Adjustable LED desk lamp with touch controls.',
        price: 34.99,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
        category: 'Home',
        rating: 4.2,
        numReviews: 73
    }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce')
.then(async () => {
    console.log('MongoDB connected for seeding...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');
    await Product.insertMany(seedProducts);
    console.log('Sample products inserted.');
    mongoose.connection.close();
})
.catch(err => {
    console.error(err);
    mongoose.connection.close();
});
