import { exec } from 'child_process';
const command = 'which python3 || which python';

// First check if Python is available
exec(command, (error, pythonPath) => {
  if (error) {
    console.error('Python is not installed. Please install Python first.');
    return;
  }

  // If Python is found, run the script using the found Python path
  const pythonCommand = `${pythonPath.trim()} code.py`;
  exec(pythonCommand, (error, stdout) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(stdout);
  });
});