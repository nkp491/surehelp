
#!/bin/bash
# Script to reinstall dependencies and fix TypeScript issues

# Remove node_modules to ensure clean install
echo "Removing node_modules..."
rm -rf node_modules

# Install dependencies
echo "Installing dependencies..."
npm install

# Install types for React and other libraries
echo "Installing TypeScript type definitions..."
npm install --save-dev @types/react @types/react-dom @types/node @types/react-router-dom

echo "Dependencies reinstalled successfully!"
echo "Please run 'npm run dev' to start the development server."
