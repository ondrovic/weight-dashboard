// src/config/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import glob from 'glob';

dotenv.config();

// Define interfaces for our structures
interface Tag {
  name: string;
  description: string;
  'x-displayName'?: string;
  'x-tagGroups'?: string[];
}

interface TagGroup {
  name: string;
  tags: string[];
}

interface Resource {
  version: string;
  name: string;
}

interface ApiStructure {
  versions: string[];
  resourcesByVersion: Map<string, Set<string>>;
  resources: Resource[];
}

// Helper functions
const buildTagName = (version: string, resource: string): string => 
  `${version}/${resource}`;

// Get server URL with fallback to prevent empty value
const serverUrl = process.env.CORS_ORIGIN || 'http://localhost:3001';

// Function to extract versions and resources from route files
const extractApiStructure = (): ApiStructure => {
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = glob.sync(path.join(routesDir, '**/*.routes.ts').replace(/\\/g, '/'));
  
  const versions = new Set<string>();
  const resourcesByVersion = new Map<string, Set<string>>();
  const resources: Resource[] = [];
  
  routeFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Extract paths from JSDoc comments
    const pathMatches = content.match(/\/api\/([^:]*?):/g);
    if (pathMatches) {
      pathMatches.forEach(match => {
        const pathParts = match.replace(':', '').split('/');
        if (pathParts.length >= 4) { // /api/v1/resource
          const version = pathParts[2]; // 'v1'
          const resource = pathParts[3]; // 'settings' or 'weight'
          
          if (version && resource) {
            versions.add(version);
            
            if (!resourcesByVersion.has(version)) {
              resourcesByVersion.set(version, new Set<string>());
            }
            
            resourcesByVersion.get(version)?.add(resource);
            resources.push({ version, name: resource });
          }
        }
      });
    }
  });
  
  return {
    versions: Array.from(versions),
    resourcesByVersion,
    resources
  };
};

// Generate tags and tag groups for ReDoc
const generateReDocStructure = (): { tags: Tag[], tagGroups: TagGroup[] } => {
  const { versions, resourcesByVersion } = extractApiStructure();
  
  const tags: Tag[] = [];
  const tagGroups: TagGroup[] = [];
  
  // Create version tag groups
  versions.forEach(version => {
    const versionName = version;
    const versionTags: string[] = [];
    
    // Add resource tags under each version
    const resources = resourcesByVersion.get(version) || new Set<string>();
    resources.forEach(resource => {
      const resourceName = resource;
      const tagName = buildTagName(version, resource);
      
      tags.push({
        name: tagName,
        description: `${resourceName} operations`,
        'x-displayName': resourceName,
        'x-tagGroups': [versionName]
      });
      
      versionTags.push(tagName);
    });
    
    // Add version tag group
    tagGroups.push({
      name: versionName,
      tags: versionTags
    });
  });
  
  return { tags, tagGroups };
};

// Process the specs to modify the tags for each operation
const processOperationTags = (spec: any): any => {
  const { resources } = extractApiStructure();
  const modifiedSpec = JSON.parse(JSON.stringify(spec));
  
  // Process all paths
  for (const path in modifiedSpec.paths) {
    const pathParts = path.split('/');
    let version: string | null = null;
    let resource: string | null = null;
    
    // Extract version and resource from path
    if (pathParts.length >= 4 && pathParts[1] === 'api') {
      version = pathParts[2]; // v1
      resource = pathParts[3]; // settings or weight
    }
    
    // Skip if we couldn't extract version or resource
    if (!version || !resource) continue;
    
    // Update tags for each operation
    for (const method in modifiedSpec.paths[path]) {
      const operation = modifiedSpec.paths[path][method];
      
      // Replace tags with our hierarchical structure
      if (operation.tags) {
        operation.tags = [buildTagName(version, resource)];
      }
    }
  }
  
  return modifiedSpec;
};

// Build Swagger options with ReDoc extensions
const buildSwaggerOptions = (): swaggerJsdoc.Options => {
  const { tags, tagGroups } = generateReDocStructure();
  
  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Weight Tracker API',
        version: '1.0.0',
        description: 'API for tracking weight and related metrics',
        license: {
          name: 'MIT',
          url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
          name: 'API Support',
          url: 'https://yourwebsite.com/support',
          email: 'support@yourwebsite.com',
        },
      },
      servers: [
        {
          url: serverUrl,
          description: 'Development server',
        },
      ],
      tags: tags,
      // ReDoc-specific extension
      'x-tagGroups': tagGroups
    },
    // Path to the API docs
    apis: [
      path.join(__dirname, '../routes/**/*.ts'),  // All route files
      path.join(__dirname, '../types/**/*.ts'),   // All type definitions
      path.join(__dirname, '../models/**/*.ts'),  // All model definitions
    ],
  };
};

// Generate the base specs and process them
const generateSpecs = (): any => {
  const options = buildSwaggerOptions();
  const baseSpecs = swaggerJsdoc(options);
  return processOperationTags(baseSpecs);
};

// Generate the final specs
const redocSpecs = generateSpecs();

// Log the generated structure for debugging
console.log('Generated Tag Groups:', redocSpecs['x-tagGroups']);

export default redocSpecs;