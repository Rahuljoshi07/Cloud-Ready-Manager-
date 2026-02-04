#!/usr/bin/env node

/**
 * Database Seed Script
 * Populates the database with sample data for testing
 */

const pool = require('./src/config/database');

const sampleUsers = [
  { name: 'John Doe', email: 'john@example.com', age: 30 },
  { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  { name: 'Bob Wilson', email: 'bob@example.com', age: 35 },
  { name: 'Alice Brown', email: 'alice@example.com', age: 28 },
  { name: 'Charlie Davis', email: 'charlie@example.com', age: 32 },
  { name: 'Diana Miller', email: 'diana@example.com', age: 27 },
  { name: 'Evan Taylor', email: 'evan@example.com', age: 29 },
  { name: 'Fiona Anderson', email: 'fiona@example.com', age: 31 },
];

const sampleProducts = [
  { name: 'Laptop', description: 'High-performance laptop with 16GB RAM', price: 999.99, stock: 10 },
  { name: 'Mouse', description: 'Wireless ergonomic mouse', price: 29.99, stock: 50 },
  { name: 'Keyboard', description: 'Mechanical RGB keyboard', price: 79.99, stock: 30 },
  { name: 'Monitor', description: '27-inch 4K display', price: 399.99, stock: 15 },
  { name: 'Webcam', description: '1080p HD webcam', price: 69.99, stock: 25 },
  { name: 'Headphones', description: 'Noise-cancelling wireless headphones', price: 199.99, stock: 20 },
  { name: 'USB Hub', description: '7-port USB 3.0 hub', price: 34.99, stock: 40 },
  { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 45.99, stock: 35 },
  { name: 'Cable Organizer', description: 'Cable management system', price: 19.99, stock: 60 },
  { name: 'Laptop Stand', description: 'Aluminum adjustable laptop stand', price: 49.99, stock: 22 },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM users WHERE email LIKE \'%@example.com\'');
    await pool.query('DELETE FROM products WHERE id > 3');

    // Insert users
    console.log('Inserting users...');
    for (const user of sampleUsers) {
      await pool.query(
        'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [user.name, user.email, user.age]
      );
    }

    // Insert products
    console.log('Inserting products...');
    for (const product of sampleProducts) {
      await pool.query(
        'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4)',
        [product.name, product.description, product.price, product.stock]
      );
    }

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${sampleUsers.length} users added`);
    console.log(`   - ${sampleProducts.length} products added`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
