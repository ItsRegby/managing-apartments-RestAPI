const request = require('supertest');
const app = require('./index.js');
const assert = require('assert');

describe('REST API Tests', function () {
    it('should get list of apartments', function (done) {
        request(app)
            .get('/apartments')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert(Array.isArray(res.body), 'Response should be an array');
                done();
            });
    });

    it('should get specific apartment by ID', function (done) {
        request(app)
            .get('/apartments/1')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert(res.body.id === 1, 'Apartment ID should match');
                done();
            });
    });

    it('should create a new apartment', function (done) {
        request(app)
            .post('/apartments')
            .send({
                address: 'Test Address',
                price: 300000,
                images: [],
                ownerEmail: 'test@example.com'
            })
            .expect(201)
            .end(function (err, res) {
                if (err) return done(err);
                assert(res.body.address === 'Test Address', 'Apartment address should match');
                done();
            });
    });

    it('should update an existing apartment', function (done) {
        request(app)
            .put('/apartments/1')
            .send({
                address: 'Updated Address',
                price: 400000,
                images: [],
                ownerEmail: 'test@example.com'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert(res.body.address === 'Updated Address', 'Apartment address should match');
                assert(res.body.price === 400000, 'Apartment price should match');
                done();
            });
    });

    it('should delete an existing apartment', function (done) {
        request(app)
            .delete('/apartments/1')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert(res.body.message === 'Apartments deleted', 'Deletion message should match');
                done();
            });
    });
});
