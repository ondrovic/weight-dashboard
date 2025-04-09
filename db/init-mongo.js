db = db.getSiblingDB('weight_tracker');

// Create user
db.createUser({
  user: 'dev',
  pwd: 'devpass',
  roles: [{ role: 'readWrite', db: 'weight_tracker' }]
});

// Create collections with validation
db.createCollection('usersettings', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'tableMetrics', 'chartMetrics', 'defaultVisibleMetrics'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'User ID - must be unique'
        },
        displayName: {
          bsonType: 'string',
          description: 'Display name for the user'
        },
        tableMetrics: {
          bsonType: 'array',
          items: { bsonType: 'string' },
          description: 'Metrics to display in table'
        },
        chartMetrics: {
          bsonType: 'array',
          items: { bsonType: 'string' },
          description: 'Metrics to display in chart'
        },
        defaultVisibleMetrics: {
          bsonType: 'array',
          items: { bsonType: 'string' },
          description: 'Default visible metrics'
        },
        goalWeight: {
          bsonType: ['number', 'null'],
          description: 'Goal weight for the user'
        },
        darkMode: {
          bsonType: 'bool',
          description: 'Dark mode preference'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create weight data collection
db.createCollection('weightdatas', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'weight', 'bmi', 'bodyFatPercentage', 'visceralFat', 
                'subcutaneousFat', 'metabolicAge', 'heartRate', 'waterPercentage', 
                'boneMassPercentage', 'proteinPercentage', 'fatFreeWeight', 
                'boneMassLb', 'bmr', 'muscleMass'],
      properties: {
        date: {
          bsonType: 'date',
          description: 'Date of measurement'
        },
        weight: {
          bsonType: 'number',
          description: 'Weight measurement'
        },
        bmi: {
          bsonType: 'number',
          description: 'Body Mass Index'
        },
        bodyFatPercentage: {
          bsonType: 'number',
          description: 'Body fat percentage'
        },
        visceralFat: {
          bsonType: 'number',
          description: 'Visceral fat level'
        },
        subcutaneousFat: {
          bsonType: 'number',
          description: 'Subcutaneous fat level'
        },
        metabolicAge: {
          bsonType: 'number',
          description: 'Metabolic age'
        },
        heartRate: {
          bsonType: 'number',
          description: 'Heart rate'
        },
        waterPercentage: {
          bsonType: 'number',
          description: 'Water percentage'
        },
        boneMassPercentage: {
          bsonType: 'number',
          description: 'Bone mass percentage'
        },
        proteinPercentage: {
          bsonType: 'number',
          description: 'Protein percentage'
        },
        fatFreeWeight: {
          bsonType: 'number',
          description: 'Fat free weight'
        },
        boneMassLb: {
          bsonType: 'number',
          description: 'Bone mass in pounds'
        },
        bmr: {
          bsonType: 'number',
          description: 'Basal Metabolic Rate'
        },
        muscleMass: {
          bsonType: 'number',
          description: 'Muscle mass'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes
db.usersettings.createIndex({ userId: 1 }, { unique: true });
db.weightdatas.createIndex({ date: 1 });