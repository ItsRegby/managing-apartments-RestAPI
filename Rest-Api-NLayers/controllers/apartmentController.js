const Apartment = require('../models/apartment');

exports.getApartments = async (req, res) => {
    try {
        const { location, maxPrice, minRooms, isFeatured, isTop } = req.query;

        const apartments = await Apartment.findApartments({
            location,
            maxPrice,
            minRooms,
            isFeatured,
            isTop
        });

        res.json(apartments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getApartmentById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const apartment = await Apartment.findById(id);
        if (!apartment) {
            throw new Error('Apartment not found');
        }

        await Apartment.updateApartmentViews(id);

        res.json(apartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.createApartment = async (req, res) => {
    try {
        const { address, price, rooms, images, ownerEmail, isFeatured, isTop } = req.body;

        const newApartment = await Apartment.createApartment({
            address,
            price,
            rooms,
            images,
            ownerEmail,
            isFeatured,
            isTop
        });

        res.status(201).json(newApartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateApartment = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { address, price, rooms, images, ownerEmail, isFeatured, isTop } = req.body;

        const updatedApartment = await Apartment.updateApartment(id, {
            address,
            price,
            rooms,
            images,
            ownerEmail,
            isFeatured,
            isTop
        });

        res.json(updatedApartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteApartment = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        await Apartment.deleteApartment(id);

        res.json({ message: 'Apartment deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
