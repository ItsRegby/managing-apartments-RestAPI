const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secretKey = 'secret';

const app = express();
const PORT = 3000;

// Допоміжний об'єкт для збереження даних про квартири (типу БД)
let apartments = [
    { id: 1, address: '123 Shevchenka St', price: 200000, rooms: 3, images: [], ownerEmail: 'owner1@example.com', views: 0, isFeatured: true, isTop: false},
    { id: 2, address: '456 Lvivska St', price: 250000, rooms: 2, images: [], ownerEmail: 'owner2@example.com', views: 0 , isFeatured: true, isTop: true},
    { id: 3, address: '789 Lesi Ukrainku St', price: 300000, rooms: 4, images: [], ownerEmail: 'owner3@example.com', views: 0 , isFeatured: true, isTop: false},
    { id: 4, address: '101 V.Koguba St', price: 180000, rooms: 1, images: [], ownerEmail: 'owner4@example.com', views: 0 , isFeatured: false, isTop: false},
    { id: 5, address: '222 Universytetska St', price: 220000, rooms: 3, images: [], ownerEmail: 'owner5@example.com', views: 0 , isFeatured: true, isTop: true}
];

// Структура для збереження зареєстрованих користувачів
let users = [
    { email: 'owner1@example.com', password: 'password1', role: 'owner' },
    { email: 'owner2@example.com', password: 'password2', role: 'realtor' },
    { email: 'owner3@example.com', password: 'password3', role: 'buyer' },
    { email: 'owner4@example.com', password: 'password4', role: 'realtor' },
    { email: 'owner5@example.com', password: 'password5', role: 'buyer' }
];


app.use(bodyParser.json());

module.exports = app;

// Ендпоїнт реєстрації користувача
app.post('/register', (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Перевірка чи вже існує користувач з такою ж електронною адресою
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            throw new Error('Користувач з такою електронною адресою вже існує');
        }

        // Додавання нового користувача
        const newUser = { email, password, role };
        users.push(newUser);

        // Створення токену для нового користувача
        const token = jwt.sign({ email, role }, secretKey);

        res.status(201).json({ message: 'Користувач зареєстрований', token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ендпоїнт автентифікації користувача
app.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Пошук користувача за електронною адресою та паролем
        const user = users.find(user => user.email === email && user.password === password);
        if (!user) {
            throw new Error('Неправильна електронна адреса або пароль');
        }

        // Створення токену для автентифікованого користувача з терміном життя 1 година
        const token = jwt.sign({ email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });

        res.json({ message: 'Автентифікація успішна', token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});


// Перевірка токену
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Отримати список квартир з можливістю фільтрації за ціною
app.get('/apartments', (req, res) => {
    try {
        // Отримуємо параметри фільтрації з запиту
        const { location, maxPrice, minRooms, isFeatured, isTop } = req.query;

        // Копіюємо всі квартири у відфільтровані квартири (початково вони рівні усім квартирам)
        let filteredApartments = [...apartments];

        // Фільтруємо за розташуванням
        if (location) {
            filteredApartments = filteredApartments.filter(apartment => apartment.address.toLowerCase().includes(location.toLowerCase()));
        }

        // Фільтруємо за максимальною ціною
        if (maxPrice) {
            const parsedMaxPrice = parseInt(maxPrice);
            filteredApartments = filteredApartments.filter(apartment => apartment.price <= parsedMaxPrice);
        }

        // Фільтруємо за мінімальною кількістю кімнат
        if (minRooms) {
            const parsedMinRooms = parseInt(minRooms);
            filteredApartments = filteredApartments.filter(apartment => apartment.rooms >= parsedMinRooms);
        }

        // Фільтруємо за флажком isFeatured
        if (isFeatured) {
            filteredApartments = filteredApartments.filter(apartment => apartment.isFeatured === (isFeatured === 'true'));
        }

        // Фільтруємо за флажком isTop
        if (isTop) {
            filteredApartments = filteredApartments.filter(apartment => apartment.isTop === (isTop === 'true'));
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

        apartments[index].views++;

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
app.post('/apartments', authenticateToken, (req, res) => {
    try {
        const { address, price, rooms, images, ownerEmail,isFeatured,isTop } = req.body;

        if (!address || typeof address !== 'string') {
            throw new Error('Адреса квартири відсутня або має невірний формат');
        }

        if (!price || typeof price !== 'number' || isNaN(price)) {
            throw new Error('Ціна квартири відсутня або має невірний формат');
        }

        if (!rooms || typeof rooms !== 'number' || isNaN(rooms)) {
            throw new Error('Кількість кімнат відсутня або має невірний формат');
        }

        if (!ownerEmail || typeof ownerEmail !== 'string' || !validateEmail(ownerEmail)) {
            throw new Error('Електронна пошта власника квартири відсутня або має невірний формат');
        }

        // Створення нової квартири з вказаними даними
        const newApartment = {
            id: apartments.length + 1,
            address,
            price,
            rooms,
            images: Array.isArray(images) ? images : [],
            ownerEmail,
            views: 0,
            isFeatured: isFeatured || false,
            isTop: isTop || false
        };

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
app.post('/apartments/:id/images', authenticateToken, (req, res) => {
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
app.post('/apartments/:id/message', authenticateToken, (req, res) => {
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
app.put('/apartments/:id', authenticateToken, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { address, price, rooms, images, ownerEmail, isFeatured, isTop } = req.body;

        const index = apartments.findIndex(apartment => apartment.id === id);
        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return; // Повертаємо з функції, оскільки квартира не знайдена
        }

        apartments[index] = { ...apartments[index], address, price, rooms, images, ownerEmail, isFeatured: isFeatured || false, isTop: isTop || false };
        res.json(apartments[index]);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Видалення квартири за її ідентифікатором, з умовою авторизації
app.delete('/apartments/:id', authenticateToken, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = req.user; // Отримуємо користувача з токену

        const index = apartments.findIndex(apartment => apartment.id === id);
        if (index === -1) {
            res.status(404).json({ message: 'Квартира не знайдена' });
            return;
        }

        // Перевірка, чи користувач має право видалити цю квартиру
        if (apartments[index].ownerEmail !== user.email) {
            res.status(403).json({ message: 'Немає прав на видалення цієї квартири' });
            return;
        }

        apartments.splice(index, 1);
        res.json({ message: 'Квартира видалена' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


app.get('/users', (req, res) => {
    try {
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Запускаємо сервер
app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
});
