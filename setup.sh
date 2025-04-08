
#!/bin/bash

echo "Installing dependencies..."

# Install core dependencies
npm install date-fns date-fns-tz lucide-react

# Install or update @tanstack/react-query to latest version
npm install @tanstack/react-query

echo "Installation complete. You can now run the app with 'npm run dev'"

