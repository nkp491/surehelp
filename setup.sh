
#!/bin/bash

# Make the scripts executable
chmod +x reinstall-deps.sh
chmod +x install-types.sh

# Run the reinstall script
./reinstall-deps.sh

# Additionally install the types
./install-types.sh

# Add a message about starting the development server
echo "Setup complete! You can now start the development server with 'npm run dev'"
