# S3 Reverse Proxy

A reverse proxy server that dynamically routes requests to appropriate directories in an Amazon S3 bucket based on subdomains.

## Overview

This service enables accessing build artifacts stored in an S3 bucket through custom subdomains. It maps each subdomain to a corresponding directory in the S3 bucket, making deployment previews easily accessible through URLs like `[build-id].yourdomain.com`.

## Features

- Dynamic routing based on subdomain
- Automatic index.html resolution for root paths
- Simple and lightweight implementation

## Prerequisites

- Node.js (v12 or higher recommended)
- npm or yarn

## Dependencies

- express: Web server framework
- http-proxy: HTTP proxy implementation

## Installation

```bash
# Install dependencies
npm install

# or using yarn
yarn install
```

## Configuration

The proxy can be configured through environment variables:

- `PORT`: The port on which the server will listen (defaults to 8000)

The S3 bucket path is configured in the code as `BASE_PATH`. Modify this constant in `index.js` if you need to point to a different S3 bucket.

## Usage

Start the server:

```bash
node index.js
```

## How it Works

1. The server receives a request from a subdomain (e.g., `build-123.yourdomain.com`)
2. It extracts the subdomain (`build-123`)
3. It forwards the request to the corresponding path in the S3 bucket (`https://ship-flow-builds.s3.ap-south-1.amazonaws.com/builds/build-123/`)
4. If the request is for the root path (`/`), it automatically appends `index.html`

## Example

Request to: `build-123.yourdomain.com/assets/main.js`

Proxies to: `https://ship-flow-builds.s3.ap-south-1.amazonaws.com/builds/build-123/assets/main.js`

## License

[MIT](LICENSE)
