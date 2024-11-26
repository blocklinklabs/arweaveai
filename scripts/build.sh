#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Make sure the .next directory exists and has content
if [ ! -d ".next" ]; then
  echo "Build failed - .next directory not found"
  exit 1
fi 