const express = require('express')

const mysql = require('mysql2')

const cors =require('cors')
require('dotenv').config();

const app = express ()
app.use(express.json())

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD, 
  database: process.env.DATABASE,
  port: process.env.PORT,
  ssl: {
    rejectUnauthorized: false  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.PORT}`);
});


db.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    return;
  }
  console.log('Connected to remote MySQL');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      product_id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('✅ Table "products" is ready.');
    }
  });
});
app.use(cors());

app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json(err)
    res.json(results);

  });
});

app.post('/products', (req, res) => {
  const productName  = req.body.product_name
  
  console.log(req.body)
  db.query('INSERT INTO products (product_name) values (?)', [productName], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('created')
  });
})

app.delete('/products/:id', (req, res) => {
  db.query('DELETE FROM products WHERE product_id = ?', [req.params.id], (err, result) => {
     if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (err) return res.status(500).send(err);
    res.status(201).send({message: 'Product deleted'})
  });
})

app.put('/products/:id', (req,res) =>{
  const {id} = req.params;
  const {product_name} = req.body;

  db.query('UPDATE products SET product_name = ? WHERE product_id = ?', [product_name, id], (err, result) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({message: 'Product not found'})
      }
      if (err){
        return res.status(500).json({message:'Update Error'})
      }
      res.status(200).json({message: ' Update Sucessfull'})
  })
})