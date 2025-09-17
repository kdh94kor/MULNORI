import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MULNORI API',
      version: '1.0.0',
      description: 'MULNORI API SWAGGER',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
  },
  apis: [path.join(__dirname, './server.ts'), path.join(__dirname, './src/entity/*.ts')],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
  console.log('swagger docs : http://localhost:3000/api-docs');
};
