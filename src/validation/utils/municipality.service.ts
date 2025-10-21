import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MunicipalityService {
  private readonly logger = new Logger(MunicipalityService.name);
  private prismaClient: any;
  private municipalitiesCache: Set<string> = new Set();
  private isInitialized = false;

  constructor() {
    // Try to dynamically load Prisma client if available
    try {
      const { PrismaClient } = require('@prisma/client');
      this.prismaClient = new PrismaClient();
      this.logger.log('Prisma client loaded successfully');
    } catch (error) {
      this.logger.warn('Prisma client not available, will use CSV fallback');
    }
  }

  /**
   * Initialize the service by loading municipalities from database or CSV
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Try to load from database first
      if (this.prismaClient) {
        await this.loadFromDatabase();
      } else {
        // Fallback to CSV
        await this.loadFromCSV();
      }
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize MunicipalityService', error);
      throw error;
    }
  }

  /**
   * Load municipalities from Prisma database
   */
  private async loadFromDatabase(): Promise<void> {
    try {
      this.logger.log('Loading municipalities from database...');
      const municipalities = await this.prismaClient.municipality.findMany({
        select: { code: true },
      });

      this.municipalitiesCache.clear();
      municipalities.forEach((municipality: { code: string }) => {
        this.municipalitiesCache.add(municipality.code);
      });

      this.logger.log(
        `Loaded ${this.municipalitiesCache.size} municipalities from database`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to load municipalities from database, falling back to CSV',
        error,
      );
      await this.loadFromCSV();
    }
  }

  /**
   * Load municipalities from CSV file as fallback
   */
  private async loadFromCSV(): Promise<void> {
    try {
      this.logger.log('Loading municipalities from CSV...');

      // Try multiple possible paths for the CSV
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'municipalities.csv'),
        path.join(process.cwd(), 'prisma', 'data', 'municipalities.csv'),
        path.join(__dirname, '..', '..', '..', 'data', 'municipalities.csv'),
      ];

      let csvPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          csvPath = possiblePath;
          break;
        }
      }

      if (!csvPath) {
        throw new Error('CSV file not found in any expected location');
      }

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // Skip header line and process data
      const dataLines = lines.slice(1).filter((line) => line.trim().length > 0);

      this.municipalitiesCache.clear();
      for (const line of dataLines) {
        const columns = line.split(';');
        if (columns.length >= 3) {
          const municipalityCode = columns[2]?.trim();
          if (municipalityCode) {
            this.municipalitiesCache.add(municipalityCode);
          }
        }
      }

      this.logger.log(
        `Loaded ${this.municipalitiesCache.size} municipalities from CSV`,
      );
    } catch (error) {
      this.logger.error('Failed to load municipalities from CSV', error);
      throw error;
    }
  }

  /**
   * Validate if a municipality code exists in the INEP auxiliary table
   * @param municipalityCode The municipality code to validate
   * @returns Promise<boolean> True if the municipality code is valid
   */
  async isValidMunicipality(municipalityCode: string): Promise<boolean> {
    if (!municipalityCode || municipalityCode.trim() === '') {
      return false;
    }

    // Initialize if not done yet
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedCode = municipalityCode.trim();
    return this.municipalitiesCache.has(normalizedCode);
  }

  /**
   * Get total count of loaded municipalities (for debugging/stats)
   */
  getMunicipalityCount(): number {
    return this.municipalitiesCache.size;
  }

  /**
   * Check if service is properly initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Clean up resources
   */
  async onModuleDestroy(): Promise<void> {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}
