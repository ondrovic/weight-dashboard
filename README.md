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

### Installation and Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd weight-tracker
   ```

2. Set up environment variables:
   ```
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs
   - MongoDB (for development): mongodb://localhost:27017

### Local Development

#### Backend
See [Local Dev Guide](local-dev-guide.md)

#### Frontend
```
cd frontend
npm install
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/weight | Get all weight data records |
| GET | /api/weight/stats | Get weight statistics |
| GET | /api/weight/range | Get weight data for a date range |
| POST | /api/weight/upload | Upload and process raw data |
| DELETE | /api/weight/:id | Delete a specific record |

## License

[MIT License](LICENSE)