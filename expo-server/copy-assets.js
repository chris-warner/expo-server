const fs = require('fs');
const path = require('path');

const sourceDir = './build/dist';
const destinationDir = './android/app/src/main/assets/dist';

// Check if the source directory exists
if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory '${sourceDir}' does not exist.`);
    process.exit(1);
}

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
    console.log(`Created destination directory '${destinationDir}'.`);
}

// Function to recursively copy files from source to destination
function copyFiles(source, destination) {
    const files = fs.readdirSync(source);

    files.forEach(file => {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);

        if (fs.lstatSync(srcPath).isDirectory()) {
            // If it's a directory, recursively copy its contents
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            copyFiles(srcPath, destPath);
        } else {
            // If it's a file, copy it to the destination
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${srcPath} to ${destPath}`);
        }
    });
}

// Copy files from source to destination
copyFiles(sourceDir, destinationDir);
console.log('Copy operation completed.');
