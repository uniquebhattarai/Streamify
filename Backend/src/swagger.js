import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import swaggerAutogen from 'swagger-autogen';

const PORT = process.env.PORT || 3069;

const doc = {
  info: {
    title: 'Streamify API Documentation',
    description: 'API documentation for the Streamify MERN application',
  },
  host: `localhost:${PORT}`,
  basePath: '/',
  schemes: ['http'],

  tags: [
    { name: 'User', description: 'Operations related to user accounts' },
    { name: 'Videos', description: 'Video management and streaming' },
    { name: 'Likes', description: 'Like/Unlike functionality' },
    { name: 'Comments', description: 'Video comment management' },
    { name: 'Playlists', description: 'User collection of videos' },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter: Bearer <token>'
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.js'];

swaggerAutogen()(outputFile, routes, doc);