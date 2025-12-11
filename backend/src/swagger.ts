import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ticket Booking API',
            version: '1.0.0',
            description: 'API for Managing Shows and Bookings',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
