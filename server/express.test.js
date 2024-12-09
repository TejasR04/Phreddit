const request = require('supertest');
const app = require('./server'); // Adjust path if needed

test('Server is listening on port 8000', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200); // Assuming 200 OK status for home route
});
