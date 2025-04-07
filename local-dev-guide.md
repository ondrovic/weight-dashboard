# Local Development Setup

## Setting Up MongoDB for Local Development

When developing locally without Docker, you'll need a local MongoDB instance. Here are several options:

### Option 1: Install MongoDB Community Edition

1. **Install MongoDB Community Edition**:
   - [Windows Installation Guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
   - [macOS Installation Guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
   - [Linux Installation Guide](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

2. **Start MongoDB Service**:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Verify Installation**:
   ```
   mongosh
   ```

### Option 2: Use MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add to your `.env` file:
   ```
   MONGODB_URI=your_connection_string
   ```

### Option 3: Run just the MongoDB Docker container

If you'd prefer to use Docker just for MongoDB:

```bash
docker run -d -p 27017:27017 --name weight-tracker-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:6.0
```

Then set your connection string in `.env`:
```
MONGODB_URI=mongodb://admin:password@localhost:27017/weight_tracker
```

## MongoDB GUI Tools

These tools make it easier to work with your MongoDB database:

- [MongoDB Compass](https://www.mongodb.com/products/compass) - Official MongoDB GUI
- [Studio 3T](https://studio3t.com/) - Full-featured MongoDB GUI
- [NoSQLBooster](https://nosqlbooster.com/) - Comprehensive MongoDB management tool

## Running the Backend in Development Mode

```bash
cd backend
npm install
npm run dev
```

The backend will automatically try to connect to MongoDB at `mongodb://localhost:27017/weight_tracker` by default in development mode.
