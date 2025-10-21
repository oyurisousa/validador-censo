const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedKnowledgeAreas() {
  console.log('🌱 Seeding knowledge area categories and knowledge areas...');

  // Path to the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'area_of_​​knowledge.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Skip first 2 header lines
    const dataLines = lines.slice(2).filter((line) => line.trim().length > 0);

    console.log(`📊 Found ${dataLines.length} records to process`);

    // Clear existing data (cascade will delete related records)
    await prisma.knowledgeArea.deleteMany();
    await prisma.knowledgeAreaCategory.deleteMany();
    console.log('🗑️ Cleared existing data');

    // Parse CSV and organize data
    const categoriesMap = new Map();
    const knowledgeAreas = [];

    let currentCategoryCode = '';
    let currentCategoryName = '';
    let categoryCounter = 0;

    for (const line of dataLines) {
      // Split by semicolon (CSV separator)
      const columns = line.split(';');
      const firstColumn = columns[0]?.trim() || '';
      const secondColumn = columns[1]?.trim() || '';

      // Check if this is a category line
      // Categories have text in first column but no number, and empty second column
      // Example: "Linguagens;;;;"
      if (firstColumn && !secondColumn && !/^\d+$/.test(firstColumn)) {
        // This is a category
        categoryCounter++;
        currentCategoryCode = `CAT${categoryCounter}`;
        currentCategoryName = firstColumn;

        if (!categoriesMap.has(currentCategoryCode)) {
          categoriesMap.set(currentCategoryCode, {
            code: currentCategoryCode,
            name: currentCategoryName,
          });
        }
        continue;
      }

      // Check if this is a knowledge area (has code and name)
      if (firstColumn && secondColumn && /^\d+$/.test(firstColumn)) {
        // This is a knowledge area
        knowledgeAreas.push({
          code: firstColumn,
          name: secondColumn,
          categoryCode: currentCategoryCode || null,
        });
      }
    }

    // Insert Categories first
    console.log(`📍 Creating ${categoriesMap.size} knowledge area categories...`);
    const categoriesToCreate = Array.from(categoriesMap.values());

    if (categoriesToCreate.length > 0) {
      await prisma.knowledgeAreaCategory.createMany({
        data: categoriesToCreate,
        skipDuplicates: true,
      });

      console.log(`✅ Created ${categoriesToCreate.length} knowledge area categories`);
    }

    // Insert Knowledge Areas in batches
    console.log(`📍 Creating ${knowledgeAreas.length} knowledge areas...`);
    const batchSize = 100;

    for (let i = 0; i < knowledgeAreas.length; i += batchSize) {
      const batch = knowledgeAreas.slice(i, i + batchSize);

      await prisma.knowledgeArea.createMany({
        data: batch,
        skipDuplicates: true,
      });

      console.log(
        `📍 Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(knowledgeAreas.length / batchSize)}`
      );
    }

    console.log(`✅ Successfully imported ${knowledgeAreas.length} knowledge areas`);

    // Show some stats
    const totalCategories = await prisma.knowledgeAreaCategory.count();
    const totalKnowledgeAreas = await prisma.knowledgeArea.count();

    console.log(`📈 Total knowledge area categories in database: ${totalCategories}`);
    console.log(`📈 Total knowledge areas in database: ${totalKnowledgeAreas}`);

    // Show knowledge areas by category
    const categoryStats = await prisma.knowledgeAreaCategory.findMany({
      include: {
        _count: {
          select: {
            knowledgeAreas: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    console.log('📊 Knowledge areas by category:');
    categoryStats.forEach((category) => {
      console.log(
        `   ${category.code} - ${category.name}: ${category._count.knowledgeAreas} areas`
      );
    });
  } catch (error) {
    console.error('❌ Error seeding knowledge areas:', error);
    throw error;
  }
}

module.exports = { seedKnowledgeAreas };
