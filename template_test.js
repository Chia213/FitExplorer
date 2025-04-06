// Main function
async function main() {
  console.log('Starting test process...');

  // Get token
  console.log('Attempting to get authentication token...');
  const token = await getToken();
  if (!token) {
    console.error('Could not get token, aborting');
    return;
  }
  
  console.log('Got token, proceeding...');
  
  // Check existing routines
  await checkRoutines(token);
  
  // Check folders
  await checkFolders(token);
  
  // Save workout templates
  console.log('Saving workout templates...');
  const saveResult = await saveWorkoutTemplates(token);
  if (!saveResult) {
    console.error('Failed to save templates');
    return;
  }
  
  // Check routines again after saving templates
  console.log('Checking routines after saving templates...');
  const templates = await checkRoutines(token);
  
  // Check folders again after saving templates
  console.log('Checking folders after saving templates...');
  await checkFolders(token);
  
  console.log(`Test completed. Found ${templates.length} template routines.`);
} 