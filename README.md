# Weight Tracker Application

A full-stack application for tracking and visualizing weight data from a smart scale.

## Project Overview

This application converts raw exported data from a smart scale into a structured format, stores it in MongoDB, and provides visualization and analysis tools through a web interface.

### Features

- CSV data import from smart scale exports
- Data conversion from raw format to structured format
- MongoDB for persistent data storage
- Data visualization with charts
- Historical data table with pagination
- Weight statistics dashboard
- Date range filtering
- Record deletion functionality
- Responsive design

## Technology Stack

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose ODM
- CSV parsing with csv-parse
- OpenAPI documentation with Swagger
- File uploads with Multer

### Frontend

- React 18
- TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication

### Infrastructure

- Docker containerization
- MongoDB container
- Nginx for frontend serving
- Docker Compose for orchestration

## Project Structure

The project follows a clear separation of concerns with a frontend and backend:

```
weight-tracker/
├── docker-compose.yml           # Orchestrates containers (Backend, Frontend, MongoDB)
├── backend/                     # Node.js API server
│   ├── src/                     # Source code
│   │   ├── config/              # Configuration files
│   │   │   └── db.ts            # MongoDB connection configuration
│   │   ├── controllers/         # API controllers
│   │   ├── models/              # MongoDB schema models
│   │   │   └── WeightData.ts    # Weight data schema
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   └── types/               # TypeScript types
│   └── Dockerfile               # Backend container configuration
└── frontend/                    # React web application
    ├── src/                     # Source code
    │   ├── components/          # React components
    │   ├── hooks/               # Custom React hooks
    │   ├── services/            # API service layer
    │   └── types/               # TypeScript types
    └── Dockerfile               # Frontend container configuration
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PowerShell 7+ (for Windows) or Bash (for Unix-like systems)

### Installation and Setup

1. Clone the repository:

   ```
   git clone <repository-url>
   cd weight-tracker
   ```

2. Use the setup script to configure and start the application:

   For Windows:

   ```
   ./setup.ps1
   ```

   For Unix-like systems:

   ```
   ./setup.sh
   ```

   The setup script provides an interactive menu with the following options:

   - Local Docker: Manage Docker containers and environment
   - Local Development: Set up development environment
   - Help: View help information

3. Choose "Local Docker" and follow these steps:

   - Select "Create Docker .env" to set up environment variables
   - Select "Start all services" to launch the application

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs
   - MongoDB (for development): mongodb://localhost:27017

### Local Development

The project includes helper scripts (`setup.ps1` for Windows and `setup.sh` for Unix-like systems) that automate common development tasks:

#### Local MongoDB Setup

For local development, you'll need to set up your own MongoDB instance. Here's a recommended setup using Docker:

1. Create a file named `init-mongo.js` with the following content:

   ```javascript
   db = db.getSiblingDB("weight_tracker");

   // Create user
   db.createUser({
     user: "dev",
     pwd: "devpass",
     roles: [{ role: "readWrite", db: "weight_tracker" }],
   });

   // Create collections with validation
   db.createCollection("usersettings", {
     validator: {
       $jsonSchema: {
         bsonType: "object",
         required: [
           "userId",
           "tableMetrics",
           "chartMetrics",
           "defaultVisibleMetrics",
         ],
         properties: {
           userId: { bsonType: "string" },
           displayName: { bsonType: "string" },
           tableMetrics: { bsonType: "array", items: { bsonType: "string" } },
           chartMetrics: { bsonType: "array", items: { bsonType: "string" } },
           defaultVisibleMetrics: {
             bsonType: "array",
             items: { bsonType: "string" },
           },
           goalWeight: { bsonType: ["number", "null"] },
           darkMode: { bsonType: "bool" },
           createdAt: { bsonType: "date" },
           updatedAt: { bsonType: "date" },
         },
       },
     },
   });

   db.createCollection("weightdatas", {
     validator: {
       $jsonSchema: {
         bsonType: "object",
         required: [
           "date",
           "weight",
           "bmi",
           "bodyFatPercentage",
           "visceralFat",
           "subcutaneousFat",
           "metabolicAge",
           "heartRate",
           "waterPercentage",
           "boneMassPercentage",
           "proteinPercentage",
           "fatFreeWeight",
           "boneMassLb",
           "bmr",
           "muscleMass",
         ],
         properties: {
           date: { bsonType: "date" },
           weight: { bsonType: "number" },
           bmi: { bsonType: "number" },
           bodyFatPercentage: { bsonType: "number" },
           visceralFat: { bsonType: "number" },
           subcutaneousFat: { bsonType: "number" },
           metabolicAge: { bsonType: "number" },
           heartRate: { bsonType: "number" },
           waterPercentage: { bsonType: "number" },
           boneMassPercentage: { bsonType: "number" },
           proteinPercentage: { bsonType: "number" },
           fatFreeWeight: { bsonType: "number" },
           boneMassLb: { bsonType: "number" },
           bmr: { bsonType: "number" },
           muscleMass: { bsonType: "number" },
           createdAt: { bsonType: "date" },
           updatedAt: { bsonType: "date" },
         },
       },
     },
   });

   // Create indexes
   db.usersettings.createIndex({ userId: 1 }, { unique: true });
   db.weightdatas.createIndex({ date: 1 });
   ```

2. Create a `docker-compose.dev.yml` file:

   ```yaml
   services:
     mongodb:
       image: mongo:latest
       container_name: weight-tracker-mongodb
       ports:
         - "27017:27017"
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: password
       volumes:
         - mongodb_dev_data:/data/db
         - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js

     mongo-express:
       image: mongo-express
       container_name: mongo-express
       ports:
         - "8081:8081"
       environment:
         ME_CONFIG_MONGODB_ADMINUSERNAME: admin
         ME_CONFIG_MONGODB_ADMINPASSWORD: password
         ME_CONFIG_MONGODB_SERVER: mongodb
         ME_CONFIG_BASICAUTH_USERNAME: admin
         ME_CONFIG_BASICAUTH_PASSWORD: password
       depends_on:
         - mongodb

   volumes:
     mongodb_dev_data:
   ```

3. Start the MongoDB containers:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. Access MongoDB Express at http://localhost:8081 to manage your database.

5. Update your backend `.env` file to use the local MongoDB:
   ```
   MONGODB_URI=mongodb://dev:devpass@localhost:27017/weight_tracker
   ```

#### Using the Helper Scripts

1. Start the helper script:

   ```
   # Windows
   ./setup.ps1

   # Unix-like systems
   ./setup.sh
   ```

2. Choose "Local Development" from the main menu to access development options:
   - Create .envs: Set up environment files for both frontend and backend
   - Install dependencies: Install all required npm packages
   - Clean dependencies: Remove node_modules and package-lock.json
   - Deploy Backend: Start the backend server
   - Deploy Frontend: Start the frontend development server
   - Deploy Full Stack: Start both frontend and backend servers

#### Manual Setup (Alternative)

If you prefer to set up manually:

1. Set up environment variables:

   ```
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

2. Install dependencies:

   ```
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

3. Start the development servers:

   ```
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## MongoDB Schema

The application uses the following MongoDB schema for weight data:

```typescript
{
  date: Date,
  weight: Number,
  bmi: Number,
  bodyFatPercentage: Number,
  visceralFat: Number,
  subcutaneousFat: Number,
  metabolicAge: Number,
  heartRate: Number,
  waterPercentage: Number,
  boneMassPercentage: Number,
  proteinPercentage: Number,
  fatFreeWeight: Number,
  boneMassLb: Number,
  bmr: Number,
  muscleMass: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Data Format

### Input Format (Raw Smart Scale Export)

The application expects a CSV file with the following columns:

- Time
- Weight
- BMI
- Body Fat
- Fat-Free Body Weight
- Subcutaneous Fat
- Visceral Fat
- Body Water
- Skeletal Muscles
- Muscle Mass
- Bone Mass
- Protein
- BMR
- Metabolic Age
- Heart Rate

### Output Format (Processed Data)

The data is transformed to the following format:

- Date
- Weight
- BMI
- Body Fat %
- V-Fat
- S-Fat
- Age
- HR
- Water %
- Bone Mass %
- Protien %
- Fat Free Weight
- Bone Mass LB
- BMR
- Muscle Mass

## API Endpoints

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| GET    | /api/weight        | Get all weight data records      |
| GET    | /api/weight/stats  | Get weight statistics            |
| GET    | /api/weight/range  | Get weight data for a date range |
| POST   | /api/weight/upload | Upload and process raw data      |
| DELETE | /api/weight/:id    | Delete a specific record         |

## License

[MIT License](LICENSE)
