const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure the uploads folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({ storage });

// Create Product route
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { name, description, price } = req.body;
    const image = req.file?.path; // Ensure you safely access req.file

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            image,
            user: req.user?.id, // Assuming user ID is attached to req.user
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err); // Log the error for debugging
        res.status(500).json({ message: 'Error creating product', error: err.message });
    }
});

// Get all products route
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('user', 'name'); // Populate user info
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

module.exports = router;
