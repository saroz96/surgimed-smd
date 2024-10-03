const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        console.log('User found:', user); // Log the user object

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' }); // User not found
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch); // Log the password comparison result

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Incorrect password
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send back the token
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error); // Log any server error
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // If using tokens, just inform the client to remove it
    res.json({ message: 'Logged out successfully' });
});



module.exports = router;
