#!/bin/bash

echo "Setting up Video Chat Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "You can download it from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit .env file with your LiveKit credentials"
fi

echo "Setup completed!"
echo
echo "To start the server, run:"
echo "npm start"
echo
echo "To start in development mode, run:"
echo "npm run dev"
echo 