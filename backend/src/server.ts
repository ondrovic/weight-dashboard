import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import redoc from 'redoc-express';
import swaggerUi from 'swagger-ui-express';
import weightRoutes from './routes/v1/weight.routes';
import settingsRoutes from './routes/v1/settings.routes';
import swaggerDoc from '../docs/swagger.json';

export const configureServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors({ origin: process.env.CORS_ORIGIN }));
  
  // Configure Helmet with exceptions for documentation tools
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com/", "blob:"],
          workerSrc: ["'self'", "blob:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"]
        }
      }
    })
  );
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/v1/weight', weightRoutes);
  app.use('/api/v1/settings', settingsRoutes);
  
  // Serve the swagger.json file
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDoc);
  });
  
  // Set up ReDoc for documentation
  app.use('/api-docs', redoc({
    title: 'Weight Tracker API Documentation',
    specUrl: '/swagger.json',
    redocOptions: {
      hideDownloadButton: false,
      sortPropsAlphabetically: false,
      expandResponses: '200,201',
      nativeScrollbars: true,
      theme: {
        sidebar: {
          width: '300px'
        }
      }
    }
  }));
  
  // Set up Swagger UI for interactive API testing
  app.use('/api-test', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
    explorer: true,
    customSiteTitle: 'Weight Tracker API Testing',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
      persistAuthorization: true
    }
  }));

  return { app, PORT };
};

export const startServer = (app: express.Application, port: string | number) => {
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📚 API docs available at http://localhost:${port}/api-docs`);
    console.log(`🧪 API testing available at http://localhost:${port}/api-test`);
  });
};