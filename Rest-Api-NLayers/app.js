const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./resources/swagger-output.json');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/apartments', apartmentRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
});
