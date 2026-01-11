import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SpotIt Backend API',
            version: '1.0.0',
            description: 'API documentation for SpotIt Backend Service',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ['./src/routes/**/*.js'], // Updated to include subdirectories
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
