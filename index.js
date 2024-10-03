const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const User = require('./models/User');  // Adjust the path to your User model
const bcrypt = require('bcryptjs');
require('dotenv').config();  // This line is enough to load your environment variables

//routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); // Import product routes

const app = express();
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Use product routes

// Seed the default admin user
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const newPassword = 'admin123';  // Set a known password
            const hashedPassword = await bcrypt.hash(newPassword, 10);  // Hash the password

            const adminUser = new User({
                name: 'Admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
            });
            await adminUser.save();
            console.log('Default admin user created with password: admin123');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

// Call the function to seed the admin user
createDefaultAdmin();

async function resetPassword() {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin user in your MongoDB database with the new hashed password
    await User.updateOne({ email: 'admin@example.com' }, { password: hashedPassword });
    console.log('Password reset to admin123');
}

resetPassword();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
