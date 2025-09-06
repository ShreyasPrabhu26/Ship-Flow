# Build Server for Ship-Flow

A containerized build service that clones projects, builds them, and uploads the build artifacts to AWS S3.

## Overview

This build server is designed to automate the process of building web applications and deploying them to an AWS S3 bucket. It:

1. Clones a Git repository specified via environment variables
2. Installs dependencies using npm
3. Runs the build process
4. Uploads the built artifacts to an AWS S3 bucket

## Prerequisites

- Docker
- AWS account with S3 bucket and appropriate permissions
- Git repository containing a Node.js project with a build script

## Environment Variables

The build server requires the following environment variables:

| Variable                | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `GIT_REPO_URL`          | URL of the Git repository to clone                   |
| `PROJECT_ID`            | Unique identifier for the project (used for S3 path) |
| `AWS_REGION`            | AWS region (e.g., 'ap-south-1')                      |
| `AWS_ACCESS_KEY_ID`     | AWS access key with permissions to write to S3       |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key paired with the access key            |
| `AWS_S3_BUCKET_NAME`    | Name of the S3 bucket to upload builds to            |

## Docker Image

The Docker image is based on Ubuntu focal and includes:

- Node.js 22.x
- Git
- Required npm packages:
  - @aws-sdk/client-s3
  - mime-types

## Usage

### Building the Docker Image

```bash
cd build-server
docker build -t ship-flow-builder .
```

### Running the Container

```bash
docker run -d \
  -e GIT_REPO_URL="https://github.com/username/repo.git" \
  -e PROJECT_ID="my-project" \
  -e AWS_REGION="ap-south-1" \
  -e AWS_ACCESS_KEY_ID="your-access-key" \
  -e AWS_SECRET_ACCESS_KEY="your-secret-key" \
  -e AWS_S3_BUCKET_NAME="your-bucket-name" \
  ship-flow-builder
```

## How It Works

1. The container starts by running `main.sh`
2. `main.sh` clones the Git repository to `/home/app/output`
3. `script.js` is executed, which:
   - Runs `npm install` and `npm run build` in the cloned repository
   - Uploads all files from the `dist` directory to the S3 bucket
   - Files are uploaded to `builds/{PROJECT_ID}/{filepath}` in the bucket

## Troubleshooting

- Ensure the Git repository is accessible
- Verify that AWS credentials have proper S3 permissions
- Check that the target repository has a valid `package.json` with a build script

## Security Notice

Never commit AWS credentials to your repository. Always provide them through environment variables or a secure secrets management system.
