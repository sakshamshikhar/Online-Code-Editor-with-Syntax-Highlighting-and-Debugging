import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the code and language from request body
    const { code, language } = await request.json();
    console.log('Received request:', { code, language });

    // Write the code to a file
    const fileName = language === 'python' ? 'code.py' : 'code.js';
    await writeFile(fileName, code);

    // Check Python or Node.js availability
    const command = await new Promise((resolve, reject) => {
      exec(
        language === 'python'
          ? 'which python3 || which python'
          : 'which node',
        (error, path) => {
          if (error || !path.trim()) {
            reject(new Error(`${language} is not installed`));
          } else {
            resolve(path.trim());
          }
        }
      );
    });

    // Execute the code using the appropriate runtime
    const result = await new Promise((resolve, reject) => {
      const executeCommand =
        language === 'python'
          ? `${command} -u ${fileName}`
          : `${command} ${fileName}`;

      exec(executeCommand, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || 'Execution failed'));
        } else {
          resolve(stdout || stderr || 'No output');
        }
      });
    });

    console.log('Execution result:', result);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json(
      {
        error: 'Error executing code',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
