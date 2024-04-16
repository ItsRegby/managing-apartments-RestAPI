const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login/loginController');
const regController = require('../controllers/registration/regController');


router.post('/register', regController.register);
router.post('/login', loginController.login);

module.exports = router;
