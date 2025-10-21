import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface KnowledgeAreaCategory {
  code: string;
  name: string;
}

interface KnowledgeArea {
  code: string;
  name: string;
  categoryCode: string | null;
}

@Injectable()
export class KnowledgeAreaService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeAreaService.name);
  private prismaClient: any;
  private categories: Map<string, KnowledgeAreaCategory> = new Map();
  private knowledgeAreas: Map<string, KnowledgeArea> = new Map();
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

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Try to load from database first
      const dbCategories =
        await this.prismaClient.knowledgeAreaCategory.findMany();
      const dbKnowledgeAreas = await this.prismaClient.knowledgeArea.findMany();

      if (dbCategories.length > 0 && dbKnowledgeAreas.length > 0) {
        // Load from database
        dbCategories.forEach((category) => {
          this.categories.set(category.code, {
            code: category.code,
            name: category.name,
          });
        });

        dbKnowledgeAreas.forEach((area) => {
          this.knowledgeAreas.set(area.code, {
            code: area.code,
            name: area.name,
            categoryCode: area.categoryCode,
          });
        });

        console.log(
          `✅ Loaded ${this.categories.size} knowledge area categories and ${this.knowledgeAreas.size} knowledge areas from database`,
        );
      } else {
        // Fallback to CSV
        await this.loadFromCSV();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing KnowledgeAreaService:', error);
      // Fallback to CSV on error
      await this.loadFromCSV();
      this.isInitialized = true;
    }
  }

  private async loadFromCSV(): Promise<void> {
    try {
      // Try multiple possible paths
      const possiblePaths = [
        path.join(process.cwd(), 'prisma', 'data', 'area_of_​​knowledge.csv'),
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'prisma',
          'data',
          'area_of_​​knowledge.csv',
        ),
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'prisma',
          'data',
          'area_of_​​knowledge.csv',
        ),
      ];

      let csvPath = '';
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          csvPath = testPath;
          break;
        }
      }

      if (!csvPath) {
        console.warn(
          '⚠️ Knowledge areas CSV file not found, service will have no data',
        );
        return;
      }

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // Skip first 2 header lines
      const dataLines = lines.slice(2).filter((line) => line.trim().length > 0);

      let currentCategoryCode = '';
      let categoryCounter = 0;

      for (const line of dataLines) {
        const columns = line.split(';');
        const firstColumn = columns[0]?.trim() || '';
        const secondColumn = columns[1]?.trim() || '';

        // Check if this is a category line
        // Categories have text in first column but no number, and empty second column
        if (firstColumn && !secondColumn && !/^\d+$/.test(firstColumn)) {
          // This is a category
          categoryCounter++;
          currentCategoryCode = `CAT${categoryCounter}`;

          this.categories.set(currentCategoryCode, {
            code: currentCategoryCode,
            name: firstColumn,
          });
          continue;
        }

        // Check if this is a knowledge area (has code and name)
        if (firstColumn && secondColumn && /^\d+$/.test(firstColumn)) {
          // This is a knowledge area
          this.knowledgeAreas.set(firstColumn, {
            code: firstColumn,
            name: secondColumn,
            categoryCode: currentCategoryCode || null,
          });
        }
      }

      console.log(
        `✅ Loaded ${this.categories.size} knowledge area categories and ${this.knowledgeAreas.size} knowledge areas from CSV`,
      );
    } catch (error) {
      console.error('Error loading knowledge areas from CSV:', error);
    }
  }

  /**
   * Check if a knowledge area code is valid
   */
  async isValidKnowledgeArea(code: string): Promise<boolean> {
    await this.initialize();
    return this.knowledgeAreas.has(code);
  }

  /**
   * Check if a category code is valid
   */
  async isValidCategory(code: string): Promise<boolean> {
    await this.initialize();
    return this.categories.has(code);
  }

  /**
   * Get knowledge area details by code
   */
  async getKnowledgeArea(code: string): Promise<KnowledgeArea | null> {
    await this.initialize();
    return this.knowledgeAreas.get(code) || null;
  }

  /**
   * Get category details by code
   */
  async getCategory(code: string): Promise<KnowledgeAreaCategory | null> {
    await this.initialize();
    return this.categories.get(code) || null;
  }

  /**
   * Get count of knowledge areas
   */
  async getKnowledgeAreaCount(): Promise<number> {
    await this.initialize();
    return this.knowledgeAreas.size;
  }

  /**
   * Get count of categories
   */
  async getCategoryCount(): Promise<number> {
    await this.initialize();
    return this.categories.size;
  }

  /**
   * Get all knowledge areas (for testing/debugging)
   */
  async getAllKnowledgeAreas(): Promise<KnowledgeArea[]> {
    await this.initialize();
    return Array.from(this.knowledgeAreas.values());
  }

  /**
   * Get all categories (for testing/debugging)
   */
  async getAllCategories(): Promise<KnowledgeAreaCategory[]> {
    await this.initialize();
    return Array.from(this.categories.values());
  }
}
