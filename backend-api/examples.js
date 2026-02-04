// API Examples - Test all endpoints

// ============================================
// USERS ENDPOINTS
// ============================================

// 1. Get all users
fetch('http://localhost:3000/api/users')
  .then(res => res.json())
  .then(data => console.log('All users:', data));

// 2. Get user by ID
fetch('http://localhost:3000/api/users/1')
  .then(res => res.json())
  .then(data => console.log('User #1:', data));

// 3. Create a new user
fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28
  })
})
  .then(res => res.json())
  .then(data => console.log('Created user:', data));

// 4. Update user
fetch('http://localhost:3000/api/users/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alice Smith',
    age: 29
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated user:', data));

// 5. Delete user
fetch('http://localhost:3000/api/users/1', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log('Deleted:', data));

// ============================================
// PRODUCTS ENDPOINTS
// ============================================

// 1. Get all products
fetch('http://localhost:3000/api/products')
  .then(res => res.json())
  .then(data => console.log('All products:', data));

// 2. Get product by ID
fetch('http://localhost:3000/api/products/1')
  .then(res => res.json())
  .then(data => console.log('Product #1:', data));

// 3. Create a new product
fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Webcam',
    description: '1080p HD webcam',
    price: 79.99,
    stock: 25
  })
})
  .then(res => res.json())
  .then(data => console.log('Created product:', data));

// 4. Update product
fetch('http://localhost:3000/api/products/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    price: 899.99,
    stock: 15
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated product:', data));

// 5. Delete product
fetch('http://localhost:3000/api/products/1', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log('Deleted:', data));

// ============================================
// HEALTH CHECK
// ============================================

fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log('Health:', data));
