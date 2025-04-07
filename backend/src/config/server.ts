import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

/**
 * Configure Express application with middleware and settings
 * @returns Configured Express application
 */
export const configureServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Apply middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger configuration
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Weight Tracker API',
        version: '1.0.0',
        description: 'API for tracking and processing weight data'
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server'
        }
      ]
    },
    apis: [
      path.join(__dirname, '../routes/*.ts'),
      path.join(__dirname, '../models/*.ts'),
      path.join(__dirname, '../types/*.ts')
    ]
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
  // Configure Swagger UI with better defaults for file uploads
  const swaggerUiOptions = {
    swaggerOptions: {
      docExpansion: 'none', // 'list', 'full', or 'none'
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true, // Pre-enables the "Try it out" option
      filter: true // Adds a search box to filter operations
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  return { app, PORT };
};

/**
 * Start the Express server
 * @param app Express application
 * @param port Server port
 */
export const startServer = (app: express.Application, port: number | string) => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API documentation available at http://localhost:${port}/api-docs`);
  });
};