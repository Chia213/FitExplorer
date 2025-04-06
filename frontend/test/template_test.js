// Simple script to check if workout templates are being saved correctly
// Run this with Node.js

import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const backendURL = 'http://localhost:8000';

// Function to get a JWT token - replace with your own credentials
async function getToken() {
  try {
    const response = await fetch(`${backendURL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with your email
        password: 'testpass'       // Replace with your password
      })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Function to save workout templates
async function saveWorkoutTemplates(token) {
  try {
    console.log('Attempting to save workout templates...');
    const response = await fetch(`${backendURL}/user/workouts/save-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save templates: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Save templates response:', data);
    return data;
  } catch (error) {
    console.error('Error saving templates:', error);
    return null;
  }
}

// Function to check routines
async function checkRoutines(token) {
  try {
    console.log('Checking routines...');
    const response = await fetch(`${backendURL}/routines`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch routines: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} routines`);
    
    // Check for template routines
    const templates = data.filter(routine => 
      routine.workout && routine.workout.is_template === true
    );
    
    console.log(`Found ${templates.length} template routines:`);
    templates.forEach((template, i) => {
      console.log(`Template ${i+1}: ${template.name}`);
      
      // Check if it has exercises
      if (template.workout && template.workout.exercises) {
        console.log(`  - Has ${template.workout.exercises.length} exercises`);
        
        // Log some details about the exercises
        template.workout.exercises.forEach((exercise, j) => {
          console.log(`    - Exercise ${j+1}: ${exercise.name}`);
          if (exercise.sets) {
            console.log(`      - Has ${exercise.sets.length} sets`);
          } else {
            console.log(`      - No sets found`);
          }
        });
      } else {
        console.log(`  - No exercises found`);
      }
    });
    
    return templates;
  } catch (error) {
    console.error('Error checking routines:', error);
    return [];
  }
}

// Fetch the folders (this was causing 404 error)
async function checkFolders(token) {
  try {
    console.log('Checking routine folders...');
    const response = await fetch(`${backendURL}/routine-folders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch folders: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} folders`);
    return data;
  } catch (error) {
    console.error('Error checking folders:', error);
    return [];
  }
}

// Main function
async function main() {
  // Get token
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
  const saveResult = await saveWorkoutTemplates(token);
  if (!saveResult) {
    console.error('Failed to save templates');
    return;
  }
  
  // Check routines again after saving templates
  const templates = await checkRoutines(token);
  
  // Check folders again after saving templates
  await checkFolders(token);
  
  console.log(`Test completed. Found ${templates.length} template routines.`);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
