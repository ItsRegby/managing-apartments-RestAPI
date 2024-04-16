const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

const secretKey = 'secret';

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });

        res.json({ message: 'Authentication successful', token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};