
#!/bin/bash

# Install TypeScript type definitions for all dependencies
npm install --save-dev \
  @types/react \
  @types/react-dom \
  @types/node \
  @types/react-router-dom \
  @types/dompurify \
  @types/react-grid-layout

echo "TypeScript definitions installed successfully!"
