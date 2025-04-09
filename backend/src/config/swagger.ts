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

interface ApiStructure {
  versions: string[];
  resourcesByVersion: Map<string, Set<string>>;
}

// Get server URL with fallback to prevent empty value
const serverUrl = process.env.CORS_ORIGIN || 'http://localhost:3001';

// Function to extract versions and resources from route files
function extractApiStructure(): ApiStructure {
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = glob.sync(path.join(routesDir, '**/*.routes.ts').replace(/\\/g, '/'));
  
  const versions = new Set<string>();
  const resourcesByVersion = new Map<string, Set<string>>();
  
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
          }
        }
      });
    }
  });
  
  return {
    versions: Array.from(versions),
    resourcesByVersion
  };
}

// Generate tags and tag groups for ReDoc
function generateReDocStructure(): { tags: Tag[], tagGroups: TagGroup[] } {
  const { versions, resourcesByVersion } = extractApiStructure();
  
  const tags: Tag[] = [];
  const tagGroups: TagGroup[] = [];
  
  // Create version tag groups
  versions.forEach(version => {
    const versionName = version.toUpperCase();
    const versionTags: string[] = [];
    
    // Add resource tags under each version
    const resources = resourcesByVersion.get(version) || new Set<string>();
    resources.forEach(resource => {
      const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
      const tagName = `${versionName}/${resourceName}`;
      
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
  
  // Add schemas tag group
  tags.push({
    name: 'Schemas',
    description: 'API schemas and models',
    'x-displayName': 'Schemas'
  });
  
  tagGroups.push({
    name: 'Data Models',
    tags: ['Schemas']
  });
  
  return { tags, tagGroups };
}

// Build Swagger options with ReDoc extensions
const { tags, tagGroups } = generateReDocStructure();

const options: swaggerJsdoc.Options = {
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

// Generate the base specs
const baseSpecs = swaggerJsdoc(options);

// Post-process the specs to modify the tags for each operation
function processOperationTags(spec: any): any {
  const { versions, resourcesByVersion } = extractApiStructure();
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
        const versionName = version.toUpperCase();
        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
        
        // Set the tag to just the resource tag under this version
        operation.tags = [`${versionName}/${resourceName}`];
      }
    }
  }
  
  // Add schema "paths" so they appear under the Schemas tag
  if (modifiedSpec.components && modifiedSpec.components.schemas) {
    for (const schemaName in modifiedSpec.components.schemas) {
      const schemaPath = `/schemas/${schemaName}`;
      
      modifiedSpec.paths[schemaPath] = {
        get: {
          tags: ['Schemas'],
          summary: `Schema for ${schemaName}`,
          responses: {
            200: {
              description: `Schema definition for ${schemaName}`,
              content: {
                'application/json': {
                  schema: {
                    $ref: `#/components/schemas/${schemaName}`
                  }
                }
              }
            }
          }
        }
      };
    }
  }
  
  return modifiedSpec;
}

const redocSpecs = processOperationTags(baseSpecs);

// Log the generated structure for debugging
console.log('Generated Tag Groups:', redocSpecs['x-tagGroups']);

export default redocSpecs;