const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', apartmentController.getApartments);
router.get('/:id', apartmentController.getApartmentById);
router.post('/', authenticateToken, apartmentController.createApartment);
router.put('/:id', authenticateToken, apartmentController.updateApartment);
router.delete('/:id', authenticateToken, apartmentController.deleteApartment);

module.exports = router;
