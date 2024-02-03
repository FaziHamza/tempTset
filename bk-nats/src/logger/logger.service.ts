import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import { format } from 'date-fns';

@Injectable()
export class LoggerService {
  private readonly logDirectory = 'logs';
  private logFilePath: string;

  constructor() {
    // Don't call createLogDirectory or createLogFile here
  }

  public async log(message: string) {
    // Your logging logic goes here
    console.log(message);

    // Check if a new log file should be created
   this.initializeLogFilePath();

    // Write to the log file
   await this.writeToFile(message);
  }

  private createLogDirectory() {
    fs.ensureDirSync(this.logDirectory);
  }

  private createLogFile() {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    this.logFilePath = `${this.logDirectory}/log_${formattedDate}.txt`;

    // Check if the log file already exists for today
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, ''); // Create an empty file
    }
  }

  private initializeLogFilePath() {
    if (!this.logFilePath) {
      this.createLogDirectory();
      this.createLogFile();
    } else if (!this.isFileForToday()) {
      this.createLogFile();
    }
  }

  private isFileForToday(): boolean {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    const expectedFilePath = `${this.logDirectory}/log_${formattedDate}.txt`;

    return this.logFilePath === expectedFilePath;
  }

  private async writeToFile(message: string) {
    try {
      await fs.appendFile(this.logFilePath, `${message}\n`);
      console.log(`Message written to ${this.logFilePath}`);
    } catch (error) {
      console.error(`Error writing to file: ${error.message}`);
    }
  }
}
