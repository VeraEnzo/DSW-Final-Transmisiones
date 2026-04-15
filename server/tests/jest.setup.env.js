'use strict';

// This file runs before any test module is loaded (Jest setupFiles).
// We set the test DATABASE_URL here so that db.js picks it up when it first
// creates the Pool, avoiding a race with require('dotenv') in test files.
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env file.');
}

process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
  'cajas_automaticas',
  'cajas_automaticas_test'
);