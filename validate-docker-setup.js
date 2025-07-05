#!/usr/bin/env node

// Validate Docker setup for Cricket Team Selection App
const fs = require('fs');
const path = require('path');

console.log('🏏 Cricket Team Selection App - Docker Setup Validation');
console.log('=====================================================\n');

const requiredFiles = [
  // Frontend files
  { path: 'client/Dockerfile', type: 'Frontend Dockerfile' },
  { path: 'client/nginx.conf', type: 'Nginx configuration' },
  { path: 'client/.dockerignore', type: 'Frontend dockerignore' },
  
  // Backend files
  { path: 'server/dockerfile', type: 'Backend Dockerfile' },
  { path: 'server/Dockerfile.dev', type: 'Backend dev Dockerfile' },
  { path: 'server/.dockerignore', type: 'Backend dockerignore' },
  { path: 'server/.env.production', type: 'Production environment' },
  
  // Docker compose files
  { path: 'docker-compose.yml', type: 'Production compose file' },
  { path: 'docker-compose.dev.yml', type: 'Development compose file' },
  
  // Scripts and documentation
  { path: 'deploy.sh', type: 'Linux/Mac deployment script' },
  { path: 'deploy.bat', type: 'Windows deployment script' },
  { path: 'DOCKER_README.md', type: 'Docker documentation' },
  { path: 'DEPLOYMENT_INSTRUCTIONS.md', type: 'Deployment instructions' }
];

let allValid = true;

console.log('📁 Checking required files...\n');

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file.path);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file.type}: ${file.path}`);
  
  if (!exists) {
    allValid = false;
  }
});

console.log('\n🔍 Checking file contents...\n');

// Check if docker-compose.yml has correct ports
try {
  const composeContent = fs.readFileSync('docker-compose.yml', 'utf8');
  
  if (composeContent.includes('3001:3001')) {
    console.log('✅ Backend port mapping (3001:3001) is correct');
  } else {
    console.log('❌ Backend port mapping is incorrect');
    allValid = false;
  }
  
  if (composeContent.includes('80:80')) {
    console.log('✅ Frontend port mapping (80:80) is correct');
  } else {
    console.log('❌ Frontend port mapping is incorrect');
    allValid = false;
  }
  
  if (composeContent.includes('redis:6379')) {
    console.log('✅ Redis URL configuration is correct');
  } else {
    console.log('❌ Redis URL configuration is incorrect');
    allValid = false;
  }
  
} catch (error) {
  console.log('❌ Could not read docker-compose.yml');
  allValid = false;
}

// Check if client constants are updated for Docker
try {
  const constantsContent = fs.readFileSync('client/src/constants/index.js', 'utf8');
  
  if (constantsContent.includes('VITE_BACKEND_URL')) {
    console.log('✅ Frontend constants support Docker environment variables');
  } else {
    console.log('❌ Frontend constants need Docker environment support');
    allValid = false;
  }
  
} catch (error) {
  console.log('❌ Could not read client constants file');
  allValid = false;
}

// Check package.json files exist
const packageFiles = [
  'client/package.json',
  'server/package.json'
];

packageFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    allValid = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('🎉 Docker setup validation PASSED!');
  console.log('\n📋 Next steps:');
  console.log('1. Start Docker Desktop');
  console.log('2. Run: deploy.bat (Windows) or ./deploy.sh (Linux/Mac)');
  console.log('3. Access your app at http://localhost');
  console.log('\n📖 For detailed instructions, see DEPLOYMENT_INSTRUCTIONS.md');
} else {
  console.log('❌ Docker setup validation FAILED!');
  console.log('\n🔧 Some files are missing or incorrectly configured.');
  console.log('Please check the errors above and fix them before deploying.');
}

console.log('\n🏗️ Architecture Overview:');
console.log('┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐');
console.log('│   Frontend      │    │    Backend      │    │     Redis       │');
console.log('│   (React+Nginx) │◄──►│  (Node.js+API)  │◄──►│   (Database)    │');
console.log('│   Port: 80      │    │   Port: 3001    │    │   Port: 6379    │');
console.log('└─────────────────┘    └─────────────────┘    └─────────────────┘');

process.exit(allValid ? 0 : 1);
