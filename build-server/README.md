# Build Server for Ship-Flow

A containerized build service that clones projects, builds them, and uploads the build artifacts to AWS S3.

---

## Overview

This build server automates the process of building web applications and deploying them to AWS. It:

1. Clones a Git repository specified via environment variables
2. Installs dependencies using npm
3. Runs the build process
4. Uploads the built artifacts to an AWS S3 bucket

---

## AWS Constructs Involved

To provide a clearer picture of how the build service integrates with AWS, the following constructs are involved:

1. **Amazon Elastic Container Service (ECS)**

   - Hosts the Dockerized build server.
   - ECS task definitions define the container runtime settings.
   - ECS (with Fargate launch type) executes the build process without needing to manage servers.

2. **Amazon Elastic Container Registry (ECR)**

   - Stores and manages Docker container images.
   - Provides a secure, scalable, and reliable registry for the build server image.
   - Integrates with IAM for access control and ECS for container deployment.

3. **Amazon S3**

   - Stores the final build artifacts.
   - Artifacts are uploaded to a specific folder path (`builds/{PROJECT_ID}/`).

4. **VPC (Virtual Private Cloud)**

   - Provides an isolated network environment where ECS tasks run.
   - Includes:
     - **Subnet(s):** Logical subdivisions of the VPC.
     - **Internet Gateway:** Allows ECS tasks to access external resources (e.g., GitHub).

5. **IAM (Identity and Access Management)**

   - Controls access and permissions.
   - The ECS task uses an **execution role** with permissions to:
     - Pull container images from ECR (if needed).
     - Upload artifacts to S3.

6. **Amazon CLI (AWS CLI)**
   - Used locally to manage AWS resources, push Docker images, and test S3 uploads.

---

## Prerequisites

- Docker installed locally
- AWS account with ECS, S3, IAM, and VPC configured
- Git repository containing a Node.js project with a build script

---

## Environment Variables

The build server requires the following environment variables:

| Variable                | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `GIT_REPO_URL`          | URL of the Git repository to clone                   |
| `PROJECT_ID`            | Unique identifier for the project (used for S3 path) |
| `AWS_REGION`            | AWS region (e.g., `ap-south-1`)                      |
| `AWS_ACCESS_KEY_ID`     | AWS access key with permissions to write to S3       |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key paired with the access key            |
| `AWS_S3_BUCKET_NAME`    | Name of the S3 bucket to upload builds to            |

---

## Docker Image

The Docker image is based on Ubuntu focal and includes:

- Node.js 22.x
- Git
- Required npm packages:
  - @aws-sdk/client-s3
  - mime-types

---

## Usage

### Building the Docker Image

```bash
cd build-server
docker build -t ship-flow-builder .
```

### Pushing to AWS ECR

```bash
# Authenticate Docker to your ECR registry
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag the image for ECR
docker tag ship-flow-builder:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ship-flow-builder:latest

# Push the image to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ship-flow-builder:latest
```
