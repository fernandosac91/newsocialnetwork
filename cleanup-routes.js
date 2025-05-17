const fs = require('fs');
const path = require('path');

// Remove any [circleId] routes to prevent conflicts
try {
  const circleIdDir = path.join(__dirname, 'src', 'app', 'api', 'circles', '[circleId]');
  if (fs.existsSync(circleIdDir)) {
    console.log(`Removing conflicting route directory: ${circleIdDir}`);
    fs.rmSync(circleIdDir, { recursive: true, force: true });
  } else {
    console.log(`Directory doesn't exist: ${circleIdDir}`);
  }
  
  // Check if there are any empty [circleId] directories elsewhere
  const appDir = path.join(__dirname, 'src', 'app');
  function findCircleIdDirs(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        if (item.name === '[circleId]') {
          console.log(`Found potentially conflicting directory: ${itemPath}`);
          fs.rmSync(itemPath, { recursive: true, force: true });
          console.log(`Removed: ${itemPath}`);
        } else {
          findCircleIdDirs(itemPath);
        }
      }
    }
  }
  
  findCircleIdDirs(appDir);
  console.log('Cleanup complete!');
} catch (error) {
  console.error('Error during cleanup:', error);
} 