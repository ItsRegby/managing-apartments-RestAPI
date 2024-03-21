const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Допоміжний об'єкт для збереження даних про квартири (типу БД)
let apartments = [
    { id: 1, address: '123 Shevchenka St', price: 200000, images: [], ownerEmail: 'owner1@example.com' },
    { id: 2, address: '456 Lvivska St', price: 250000, images: [], ownerEmail: 'owner2@example.com' },
    { id: 3, address: '789 Lesi Ukrainku St', price: 300000, images: [], ownerEmail: 'owner3@example.com' },
    { id: 4, address: '101 V.Koguba St', price: 180000, images: [], ownerEmail: 'owner4@example.com' },
    { id: 5, address: '222 Universytetska St', price: 220000, images: [], ownerEmail: 'owner5@example.com' }
];


app.use(bodyParser.json());

module.exports = app;

// Отримати список квартир з можливістю фільтрації за ціною
app.get('/apartments', (req, res) => {
    try {
        const { maxPrice } = req.query;
        let filteredApartments = apartments;

        if (maxPrice) {
            const parsedMaxPrice = parseInt(maxPrice);
            if (isNaN(parsedMaxPrice)) {
                throw new Error('Максимальна ціна повинна бути числом');
            }
            filteredApartments = filteredApartments.filter(apartment => apartment.price <= parsedMaxPrice);
        }

        res.json(filteredApartments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Отримати інформацію про конкретну квартиру за її ідентифікатором
app.get('/apartments/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = apartments.findIndex(apartment => apartment.id === id);

        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return; // Повертаємо з функції, оскільки квартира не знайдена
        }

        if (isNaN(id)) {
            throw new Error('Ідентифікатор квартири повинен бути числом');
        }

        const apartment = apartments.find(apartment => apartment.id === id);
        if (apartment) {
            res.json(apartment);
        } else {
            res.status(404).json({ message: 'Квартира не знайдена' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Створити нову квартиру
app.post('/apartments', (req, res) => {
    try {
        const { address, price, images, ownerEmail } = req.body;

        if (!address || typeof address !== 'string') {
            throw new Error('Адреса квартири відсутня або має невірний формат');
        }

        if (!price || typeof price !== 'number' || isNaN(price)) {
            throw new Error('Ціна квартири відсутня або має невірний формат');
        }

        if (!ownerEmail || typeof ownerEmail !== 'string' || !validateEmail(ownerEmail)) {
            throw new Error('Електронна пошта власника квартири відсутня або має невірний формат');
        }

        const id = apartments.length + 1;
        const newApartment = { id, address, price, images: Array.isArray(images) ? images : [], ownerEmail };
        apartments.push(newApartment);
        res.status(201).json(newApartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Валідація електронної пошти
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Завантажити нове зображення для квартири
app.post('/apartments/:id/images', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = apartments.findIndex(apartment => apartment.id === id);

        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return; // Повертаємо з функції, оскільки квартира не знайдена
        }

        const image = req.body.image;
        if (!image || typeof image !== 'string') {
            throw new Error('Зображення відсутнє або має невірний формат');
        }

        if (!apartments[index].images) {
            apartments[index].images = [image];
        } else {
            apartments[index].images.push(image);
        }

        res.status(200).json(apartments[index]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Відправити повідомлення власнику квартири
app.post('/apartments/:id/message', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = apartments.findIndex(apartment => apartment.id === id);

        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return; // Повертаємо з функції, оскільки квартира не знайдена
        }

        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            throw new Error('Повідомлення відсутнє або має невірний формат');
        }

        const ownerEmail = apartments[index].ownerEmail;

        // Додати повідомлення до масиву повідомлень квартири
        if (!apartments[index].messages) {
            apartments[index].messages = [message];
        } else {
            apartments[index].messages.push(message);
        }

        res.json({ message: `Повідомлення відправлено власнику квартири з email: ${ownerEmail}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Оновити інформацію про квартиру
app.put('/apartments/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { address, price, images, ownerEmail } = req.body;

        const index = apartments.findIndex(apartment => apartment.id === id);
        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return; // Повертаємо з функції, оскільки квартира не знайдена
        }

        apartments[index] = { ...apartments[index], address, price, images, ownerEmail };
        res.json(apartments[index]);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Видалити квартиру за її ідентифікатором
app.delete('/apartments/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const index = apartments.findIndex(apartment => apartment.id === id);
        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return; // Повертаємо з функції, оскільки квартира не знайдена
        }

        apartments.splice(index, 1);
        res.json({ message: 'Квартира видалена' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Запускаємо сервер
app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
});
