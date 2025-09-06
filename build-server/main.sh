#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Check for required environment variables
if [ -z "$GIT_REPO_URL" ]; then
  echo "Error: GIT_REPO_URL environment variable is not set"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID environment variable is not set"
  exit 1
fi

echo "Cloning repository: $GIT_REPO_URL"
git clone "$GIT_REPO_URL" /home/app/output || {
  echo "Failed to clone repository"
  exit 1
}

echo "Starting build process..."
exec node script.js
