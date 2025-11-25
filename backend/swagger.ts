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
    components: {
      schemas: {
        DivePointMst: {
          type: 'object',
          required: ['id', 'lat', 'lot', 'pointName', 'pointStatus'],
          properties: {
            id: {
              type: 'integer',
              description: 'Dive Point Master ID'
            },
            lat: {
              type: 'number',
              format: 'double',
              description: 'Latitude'
            },
            lot: {
              type: 'number',
              format: 'double',
              description: 'Longitude'
            },
            pointName: {
              type: 'string',
              description: 'Point Name'
            },
            tags: {
              type: 'string',
              description: 'Tags associated with the point'
            },
            pointStatus: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              description: 'Status of the point'
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, './src/routes/*.ts'), path.join(__dirname, './src/entity/*.ts')],
};

export const specs = swaggerJsdoc(options);

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
