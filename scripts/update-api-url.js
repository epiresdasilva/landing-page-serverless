const fs = require('fs');
const path = require('path');

// Get the API URL from command line arguments
const apiUrl = process.argv[2];

if (!apiUrl) {
  console.error('API URL is required as an argument');
  process.exit(1);
}

// Path to script.js
const scriptPath = path.join(__dirname, '..', 'src', 'js', 'script.js');

// Read the script file
fs.readFile(scriptPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading script.js:', err);
    process.exit(1);
  }

  // Replace the API URL
  const updatedData = data.replace(
    /const apiUrl = ['"].*?['"]/,
    `const apiUrl = '${apiUrl}'`
  );

  // Write the updated content back to the file
  fs.writeFile(scriptPath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to script.js:', err);
      process.exit(1);
    }
    console.log(`Successfully updated API URL to: ${apiUrl}`);
  });
});
