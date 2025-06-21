import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs'; // To check if a file exists

@Injectable()
export class IaService {
  constructor(private prisma: PrismaService) {}

  private getPythonExecutablePath(): string {
    if (process.env.PYTHON_EXECUTABLE_PATH) {
      console.log(`Using Python executable from environment variable: ${process.env.PYTHON_EXECUTABLE_PATH}`);
      return process.env.PYTHON_EXECUTABLE_PATH;
    }
    
    const projectRoot = process.cwd();
    console.log(`Project root directory: ${projectRoot}`);

    const windowsVenvPath = join(projectRoot, 'src', 'ia', '.venv', 'Scripts', 'python.exe');
    if (existsSync(windowsVenvPath)) {
      console.log(`Found Python executable at Windows venv path: ${windowsVenvPath}`);
      return windowsVenvPath;
    }

    const unixVenvPath = join(projectRoot, 'src', 'ia', '.venv', 'bin', 'python');
    if (existsSync(unixVenvPath)) {
      console.log(`Found Python executable at Unix/macOS venv path: ${unixVenvPath}`);
      return unixVenvPath;
    }

    console.warn('Could not find Python executable in virtual environment. Falling back to global "python3" or "python" command.');
    
    if (process.platform !== 'win32') { // 'python3' is more prevalent on Unix-like systems
      const python3Path = join('/usr/bin', 'python3'); // Common location on Linux
      if (existsSync(python3Path)) {
        console.log(`Found global Python executable at: ${python3Path}`);
        return python3Path;
      }
    }
    
    console.warn('No specific global Python3 path found, relying on system PATH for "python" or "python3".');
    return process.platform === 'win32' ? 'python' : 'python3'; // Use 'python' for Windows, 'python3' for others by default
  }

  

  async runPythonScript(data: { photoPath?: string; otherData?: any }): Promise<number> {
    return new Promise((resolve, reject) => {
      const pythonScriptPath = join(process.cwd(), 'src', 'python_scripts', 'check_photo.py');


      const pythonExecutable = this.getPythonExecutablePath();

      if (!pythonExecutable) {
        return reject(new Error('No Python executable path could be determined.'));
      }
      if (!existsSync(pythonExecutable) && !pythonExecutable.includes('/') && !pythonExecutable.includes('\\')) {
         console.error(`Configured Python executable path does not exist: ${pythonExecutable}`);
         return reject(new Error(`Configured Python executable does not exist: ${pythonExecutable}`));
      }


      const scriptArgs: string[] = [pythonScriptPath];

      if (data.photoPath) {
        scriptArgs.push('--photo-path');
        scriptArgs.push(data.photoPath);
      }
      // If otherData is expected:
      // if (data.otherData) {
      //   scriptArgs.push('--data');
      //   scriptArgs.push(JSON.stringify(data.otherData));
      // }

      console.log(`Attempting to spawn Python process: ${pythonExecutable} ${scriptArgs.join(' ')}`);

      const pythonProcess = spawn(pythonExecutable, scriptArgs);

      let scriptOutput = '';
      let scriptError = '';

      pythonProcess.stdout.on('data', (data) => {
        scriptOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        scriptError += data.toString();
        console.error(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const trimmedOutput = scriptOutput.trim();
            // --- PARSING LOGIC: Use JSON.parse() as Python now outputs valid JSON ---
            const parsedOutput = JSON.parse(trimmedOutput);

            // Expecting an object like { "className": "lixo", "score": 0.99 }
            if (typeof parsedOutput === 'object' && parsedOutput !== null && 'score' in parsedOutput) {
              const confidenceScore = parseFloat(parsedOutput.score);
              if (!isNaN(confidenceScore)) {
                console.log(`Python script output parsed successfully. Confidence: ${confidenceScore}`);
                resolve(confidenceScore); // Resolve with the float score
              } else {
                const errorMessage = `Parsed 'score' from Python output is not a valid number. Raw output: "${trimmedOutput}"`;
                console.error(errorMessage);
                reject(new Error(errorMessage));
              }
            } else {
              const errorMessage = `Python script output is not the expected JSON object format (missing 'score' or not an object). Raw output: "${trimmedOutput}"`;
              console.error(errorMessage);
              reject(new Error(errorMessage));
            }
          } catch (e) {
            console.error('Error parsing Python script output as JSON:', e);
            reject(new Error(`Error parsing Python script output: ${e.message}. Raw output: "${scriptOutput.trim()}"`));
          }
        } else {
          // If Python script exited with a non-zero code, it indicates an error.
          // The Python script should ideally print an error message to stderr in JSON format for clarity.
          const errorMessage = `Python script exited with code ${code}. Error: ${scriptError || 'No error output.'}`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python subprocess.', err);
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          reject(new Error(`Failed to start Python subprocess: The Python executable "${pythonExecutable}" was not found. Please ensure Python is installed and the path is correct, or set PYTHON_EXECUTABLE_PATH environment variable.`));
        } else {
          reject(new Error(`Failed to start Python subprocess: ${err.message}`));
        }
      });
    });
  }
}