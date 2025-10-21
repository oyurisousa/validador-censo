import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ComplementaryActivityService {
  private readonly logger = new Logger(ComplementaryActivityService.name);
  private prismaClient: any;
  private activitiesCache: Set<string> = new Set();
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
   * Initialize the service by loading activities from database or CSV
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
      this.logger.error(
        'Failed to initialize ComplementaryActivityService',
        error,
      );
      throw error;
    }
  }

  /**
   * Load complementary activities from Prisma database
   */
  private async loadFromDatabase(): Promise<void> {
    try {
      this.logger.log('Loading complementary activities from database...');
      const activities = await this.prismaClient.complementaryActivity.findMany(
        {
          select: { code: true },
        },
      );

      this.activitiesCache.clear();
      activities.forEach((activity: { code: string }) => {
        this.activitiesCache.add(activity.code);
      });

      this.logger.log(
        `Loaded ${this.activitiesCache.size} complementary activities from database`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to load complementary activities from database, falling back to CSV',
        error,
      );
      await this.loadFromCSV();
    }
  }

  /**
   * Load complementary activities from CSV file as fallback
   */
  private async loadFromCSV(): Promise<void> {
    try {
      this.logger.log('Loading complementary activities from CSV...');

      // Try multiple possible paths for the CSV
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'complementary_activity.csv'),
        path.join(
          process.cwd(),
          'prisma',
          'data',
          'complementary_activity.csv',
        ),
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'data',
          'complementary_activity.csv',
        ),
      ];

      let csvPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          csvPath = possiblePath;
          break;
        }
      }

      if (!csvPath) {
        throw new Error(
          'Complementary activities CSV file not found in any expected location',
        );
      }

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // Skip header line and process data
      const dataLines = lines.slice(1).filter((line) => line.trim().length > 0);

      this.activitiesCache.clear();
      for (const line of dataLines) {
        const columns = line.split(';');
        if (columns.length >= 3) {
          const activityCode = columns[2]?.trim();
          if (activityCode) {
            this.activitiesCache.add(activityCode);
          }
        }
      }

      this.logger.log(
        `Loaded ${this.activitiesCache.size} complementary activities from CSV`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to load complementary activities from CSV',
        error,
      );
      throw error;
    }
  }

  /**
   * Validate if a complementary activity code exists in the INEP auxiliary table
   * @param activityCode The complementary activity code to validate
   * @returns Promise<boolean> True if the activity code is valid
   */
  async isValidActivity(activityCode: string): Promise<boolean> {
    if (!activityCode || activityCode.trim() === '') {
      return false;
    }

    // Initialize if not done yet
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedCode = activityCode.trim();
    return this.activitiesCache.has(normalizedCode);
  }

  /**
   * Get total count of loaded activities (for debugging/stats)
   */
  getActivityCount(): number {
    return this.activitiesCache.size;
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
