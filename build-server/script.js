/**
 * Ship-Flow Build Server Script
 * 
 * This script handles the process of building a cloned repository and 
 * uploading the built artifacts to an AWS S3 bucket.
 * 
 * Flow:
 * 1. Execute npm install and build commands in the cloned repository
 * 2. Collect the built files from the dist directory
 * 3. Upload each file to the configured S3 bucket
 * 
 * Required Environment Variables:
 * - PROJECT_ID: Unique identifier for the project
 * - AWS_REGION: AWS region for the S3 bucket
 * - AWS_ACCESS_KEY_ID: AWS access key for authentication
 * - AWS_SECRET_ACCESS_KEY: AWS secret key for authentication
 * - AWS_S3_BUCKET_NAME: Name of the S3 bucket to upload to
 */

// Import required modules
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

// Get project ID from environment variables
const PROJECT_ID = process.env.PROJECT_ID;

// Initialize S3 client with AWS credentials from environment variables
/**
 * Example AWS configuration:
 * {
 *   region: 'ap-south-1',
 *   credentials: {
 *     accessKeyId: 'AKIAXXXXXXXXXXXXXXXX',
 *     secretAccessKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
 *   }
 * }
 */
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Main function to execute the build process and upload artifacts
 * 
 * This function:
 * 1. Runs the build commands in the cloned repository
 * 2. Streams the output to the console for monitoring
 * 3. Uploads the built files to S3 after successful build
 */
async function main() {
    console.log("Executing build script...");

    // Path to the cloned repository
    const outputDirectoryPath = path.resolve(__dirname, 'output');

    // Execute build commands: npm install followed by npm run build
    // Example: If the cloned repository is a React app, this will install dependencies
    // and create production build files in the 'build' or 'dist' directory
    const p = exec(`cd ${outputDirectoryPath} && npm install && npm run build`);

    // Stream standard output to console
    p.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    // Stream error output to console
    p.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    // Handle execution errors
    p.on('error', (error) => {
        console.error(`Execution error: ${error.message}`);
    });

    // Handle process completion
    p.on('close', async (code) => {
        console.log(`Build Completed with code: ${code}`);

        // If build failed (non-zero exit code), log error and exit
        if (code !== 0) {
            console.error(`Build failed with exit code ${code}`);
            return;
        }

        try {
            // Path to the built files (dist folder)
            // Note: Some frameworks might use 'build' instead of 'dist'
            // Example: React typically uses 'build', Vue and Angular often use 'dist'
            const distFolderPath = path.join(outputDirectoryPath, 'dist');

            // Read all files in the dist folder recursively
            const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true });

            // Process and upload each file
            for (const file of distFolderContents) {
                const filePath = path.join(distFolderPath, file);

                // Skip directories, we only want to upload files
                // Note: S3 doesn't have a traditional directory structure - it uses a flat object store
                // with keys that can contain slashes to simulate directories. When we upload files with
                // paths like 'js/main.js', S3 automatically creates the appearance of directories.
                // Empty directories aren't needed in S3 as the path hierarchy is created implicitly
                // by the object keys of the actual files.
                if (fs.lstatSync(filePath).isDirectory()) continue;

                // Create a relative path for the S3 key
                // Example: If filePath is '/home/app/output/dist/js/main.js',
                // and distFolderPath is '/home/app/output/dist',
                // then relativePath will be 'js/main.js'
                const relativePath = path.relative(distFolderPath, filePath);

                // Create S3 upload command
                // Final S3 path example: 'builds/my-project-id/js/main.js'
                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: `builds/${PROJECT_ID}/${relativePath}`,
                    Body: fs.createReadStream(filePath),
                    ContentType: mime.lookup(filePath) || 'application/octet-stream',
                });

                // Upload the file to S3
                await s3Client.send(command);
                console.log(`Uploaded: ${relativePath}`);
            }
            console.log("Build and Upload completed successfully.");
        } catch (error) {
            // Handle any errors during the upload process
            console.error(`Upload failed: ${error.message}`);
        }
    })
}

main();