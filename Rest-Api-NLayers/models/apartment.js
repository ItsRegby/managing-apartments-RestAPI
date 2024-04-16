const { Pool } = require('pg');
const pool = require('../resources/db');

class Apartment {
    static async findApartments(queryParams) {
        let query = 'SELECT * FROM apartments WHERE 1=1';
        const values = [];

        if (queryParams.id) {
            console.log('ID:', queryParams.id);
            query += ' AND id = $1::integer';
            values.push(parseInt(queryParams.id, 10)); // Parse to integer
        }

        if (queryParams.location) {
            query += ' AND LOWER(address) LIKE $2::text';
            values.push(`%${queryParams.location.toLowerCase()}%`);
        }

        if (queryParams.maxPrice) {
            query += ' AND price <= $3::integer';
            values.push(parseInt(queryParams.maxPrice, 10)); // Parse to integer
        }

        if (queryParams.minRooms) {
            query += ' AND rooms >= $4::integer';
            values.push(parseInt(queryParams.minRooms, 10)); // Parse to integer
        }

        if (queryParams.isFeatured) {
            query += ' AND isFeatured = $8::boolean';
            values.push(queryParams.isFeatured === 'true'); // Boolean
        }

        if (queryParams.isTop) {
            query += ' AND isTop = $9::boolean';
            values.push(queryParams.isTop === 'true'); // Boolean
        }

        const { rows } = await pool.query(query, values);
        return rows;
    }


    static async findById(id) {
        const { rows } = await pool.query('SELECT * FROM apartments WHERE id = $1', [id]);
        return rows[0] || null;
    }

    static async createApartment(data) {
        const { rows } = await pool.query(
            `INSERT INTO apartments(address, price, rooms, images, owner_email, views, is_featured, is_top) 
             VALUES($2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [
                data.address,
                data.price,
                data.rooms,
                JSON.stringify(data.images || []),
                data.ownerEmail,
                0,
                data.isFeatured || false,
                data.isTop || false
            ]
        );
        return rows[0];
    }

    static async updateApartment(id, data) {
        const { rows } = await pool.query(
            `UPDATE apartments SET 
             address = $2, 
             price = $3, 
             rooms = $4, 
             images = $5, 
             owner_email = $6, 
             is_featured = $8, 
             is_top = $9 
             WHERE id = $1 RETURNING *`,
            [
                data.address,
                data.price,
                data.rooms,
                JSON.stringify(data.images || []),
                data.ownerEmail,
                data.isFeatured,
                data.isTop,
                id
            ]
        );
        return rows[0];
    }

    static async deleteApartment(id) {
        await pool.query('DELETE FROM apartments WHERE id = $1', [id]);
    }
    static async updateApartmentViews(id) {
        const { rows } = await pool.query(
            'UPDATE apartments SET views = views + 1 WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0];
    }
}

module.exports = Apartment;
