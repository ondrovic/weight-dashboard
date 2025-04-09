// src/scripts/generate-swagger.ts

import fs from 'fs';
import path from 'path';
import redocSpecs from '../config/swagger';

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, '../../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Write the swagger.json file
fs.writeFileSync(
  path.join(docsDir, 'swagger.json'),
  JSON.stringify(redocSpecs, null, 2)
);

console.log('✅ API documentation generated successfully!');