// Load environment variables from .env.example for tests
require('dotenv').config({ path: '.env.example' });

// Set NODE_ENV to development for tests
process.env.NODE_ENV = 'development';
