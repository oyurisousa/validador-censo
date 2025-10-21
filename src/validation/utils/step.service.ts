import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StepService {
  private readonly logger = new Logger(StepService.name);
  private prismaClient: any;
  private stepsCache: Set<string> = new Set();
  private aggregatedStepsCache: Set<string> = new Set();
  private stepsByAggregatedCache: Map<string, Set<string>> = new Map();
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
   * Initialize the service by loading steps from database or CSV
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
      this.logger.error('Failed to initialize StepService', error);
      throw error;
    }
  }

  /**
   * Load steps from Prisma database
   */
  private async loadFromDatabase(): Promise<void> {
    try {
      this.logger.log('Loading steps from database...');

      // Load aggregated steps
      const aggregatedSteps = await this.prismaClient.aggregatedStep.findMany({
        select: { code: true },
      });

      this.aggregatedStepsCache.clear();
      aggregatedSteps.forEach((aggStep: { code: string }) => {
        this.aggregatedStepsCache.add(aggStep.code);
      });

      // Load steps with their aggregated step
      const steps = await this.prismaClient.step.findMany({
        select: {
          code: true,
          aggregatedStepCode: true,
        },
      });

      this.stepsCache.clear();
      this.stepsByAggregatedCache.clear();

      steps.forEach(
        (step: { code: string; aggregatedStepCode: string | null }) => {
          this.stepsCache.add(step.code);

          if (step.aggregatedStepCode) {
            if (!this.stepsByAggregatedCache.has(step.aggregatedStepCode)) {
              this.stepsByAggregatedCache.set(
                step.aggregatedStepCode,
                new Set(),
              );
            }
            this.stepsByAggregatedCache
              .get(step.aggregatedStepCode)!
              .add(step.code);
          }
        },
      );

      this.logger.log(
        `Loaded ${this.aggregatedStepsCache.size} aggregated steps and ${this.stepsCache.size} steps from database`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to load steps from database, falling back to CSV',
        error,
      );
      await this.loadFromCSV();
    }
  }

  /**
   * Load steps from CSV file as fallback
   */
  private async loadFromCSV(): Promise<void> {
    try {
      this.logger.log('Loading steps from CSV...');

      // Try multiple possible paths for the CSV
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'step.csv'),
        path.join(process.cwd(), 'prisma', 'data', 'step.csv'),
        path.join(__dirname, '..', '..', '..', 'data', 'step.csv'),
      ];

      let csvPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          csvPath = possiblePath;
          break;
        }
      }

      if (!csvPath) {
        throw new Error('Steps CSV file not found in any expected location');
      }

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // Skip first 2 header lines
      const dataLines = lines.slice(2).filter((line) => line.trim().length > 0);

      this.stepsCache.clear();
      this.aggregatedStepsCache.clear();
      this.stepsByAggregatedCache.clear();

      let currentAggregatedStepCode = '';

      for (const line of dataLines) {
        const columns = line.split(';');

        if (columns.length >= 4) {
          const aggStepCode = columns[0]?.trim() || '';
          const stepCode = columns[2]?.trim();

          // Update current aggregated step if present
          if (aggStepCode) {
            currentAggregatedStepCode = aggStepCode;
            this.aggregatedStepsCache.add(currentAggregatedStepCode);
          }

          // Add step if code is present
          if (stepCode) {
            this.stepsCache.add(stepCode);

            if (currentAggregatedStepCode) {
              if (!this.stepsByAggregatedCache.has(currentAggregatedStepCode)) {
                this.stepsByAggregatedCache.set(
                  currentAggregatedStepCode,
                  new Set(),
                );
              }
              this.stepsByAggregatedCache
                .get(currentAggregatedStepCode)!
                .add(stepCode);
            }
          }
        }
      }

      this.logger.log(
        `Loaded ${this.aggregatedStepsCache.size} aggregated steps and ${this.stepsCache.size} steps from CSV`,
      );
    } catch (error) {
      this.logger.error('Failed to load steps from CSV', error);
      throw error;
    }
  }

  /**
   * Validate if an aggregated step code exists
   */
  async isValidAggregatedStep(aggregatedStepCode: string): Promise<boolean> {
    if (!aggregatedStepCode || aggregatedStepCode.trim() === '') {
      return false;
    }

    // Initialize if not done yet
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedCode = aggregatedStepCode.trim();
    return this.aggregatedStepsCache.has(normalizedCode);
  }

  /**
   * Validate if a step code exists
   */
  async isValidStep(stepCode: string): Promise<boolean> {
    if (!stepCode || stepCode.trim() === '') {
      return false;
    }

    // Initialize if not done yet
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedCode = stepCode.trim();
    return this.stepsCache.has(normalizedCode);
  }

  /**
   * Validate if a step belongs to a specific aggregated step
   */
  async isStepCompatibleWithAggregated(
    stepCode: string,
    aggregatedStepCode: string,
  ): Promise<boolean> {
    if (!stepCode || !aggregatedStepCode) {
      return false;
    }

    // Initialize if not done yet
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedStepCode = stepCode.trim();
    const normalizedAggCode = aggregatedStepCode.trim();

    const stepsInAgg = this.stepsByAggregatedCache.get(normalizedAggCode);
    return stepsInAgg ? stepsInAgg.has(normalizedStepCode) : false;
  }

  /**
   * Get total count of loaded steps (for debugging/stats)
   */
  getStepCount(): number {
    return this.stepsCache.size;
  }

  /**
   * Get total count of loaded aggregated steps (for debugging/stats)
   */
  getAggregatedStepCount(): number {
    return this.aggregatedStepsCache.size;
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
