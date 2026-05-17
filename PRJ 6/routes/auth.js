const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

router.post('/register',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty().trim().escape(),
    body('role').isIn(['driver', 'station_operator', 'network_admin']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        
        try {
            const { email, password, name, role } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ email, password: hashedPassword, name, role });
            res.status(201).json({ message: 'Реєстрація успішна', user: { id: user.id, role: user.role } });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Вхід успішний', user: { email: req.user.email, role: req.user.role } });
});

module.exports = router;