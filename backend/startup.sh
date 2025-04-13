#!/bin/bash
# This script ensures your FastAPI app starts automatically when EC2 boots

# Navigate to your project directory
cd /home/ubuntu/FitExplorer/backend

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI app using systemd
sudo systemctl start fitexplorer

