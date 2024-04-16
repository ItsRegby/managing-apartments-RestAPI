const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

const secretKey = 'secret';

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const newUser = await User.createUser(email, hashedPassword, role);
        const token = jwt.sign({ email: newUser.email, role: newUser.role }, secretKey);

        res.status(201).json({ message: 'User registered', token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};