const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedSteps() {
  console.log('🌱 Seeding aggregated steps and steps...');

  // Path to the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'step.csv');

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
    await prisma.step.deleteMany();
    await prisma.aggregatedStep.deleteMany();
    console.log('🗑️ Cleared existing data');

    // Parse CSV and organize data
    const aggregatedStepsMap = new Map();
    const steps = [];

    let currentAggregatedStepCode = '';
    let currentAggregatedStepName = '';

    for (const line of dataLines) {
      // Split by semicolon (CSV separator)
      const columns = line.split(';');

      if (columns.length >= 4) {
        const aggStepCode = columns[0]?.trim() || '';
        const aggStepName = columns[1]?.trim() || '';
        const stepCode = columns[2]?.trim();
        const stepName = columns[3]?.trim();

        // Update current aggregated step if present
        if (aggStepCode) {
          currentAggregatedStepCode = aggStepCode;
          currentAggregatedStepName = aggStepName;

          if (!aggregatedStepsMap.has(currentAggregatedStepCode)) {
            aggregatedStepsMap.set(currentAggregatedStepCode, {
              code: currentAggregatedStepCode,
              name: currentAggregatedStepName,
            });
          }
        }

        // Add step if code and name are present
        if (stepCode && stepName) {
          steps.push({
            code: stepCode,
            name: stepName,
            aggregatedStepCode: currentAggregatedStepCode || null,
          });
        }
      }
    }

    // Insert Aggregated Steps first
    console.log(`📍 Creating ${aggregatedStepsMap.size} aggregated steps...`);
    const aggregatedStepsToCreate = Array.from(aggregatedStepsMap.values());

    await prisma.aggregatedStep.createMany({
      data: aggregatedStepsToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${aggregatedStepsToCreate.length} aggregated steps`);

    // Insert Steps in batches
    console.log(`📍 Creating ${steps.length} steps...`);
    const batchSize = 100;

    for (let i = 0; i < steps.length; i += batchSize) {
      const batch = steps.slice(i, i + batchSize);

      await prisma.step.createMany({
        data: batch,
        skipDuplicates: true,
      });

      console.log(
        `📍 Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(steps.length / batchSize)}`
      );
    }

    console.log(`✅ Successfully imported ${steps.length} steps`);

    // Show some stats
    const totalAggregatedSteps = await prisma.aggregatedStep.count();
    const totalSteps = await prisma.step.count();

    console.log(`📈 Total aggregated steps in database: ${totalAggregatedSteps}`);
    console.log(`📈 Total steps in database: ${totalSteps}`);

    // Show steps by aggregated step
    const aggStepStats = await prisma.aggregatedStep.findMany({
      include: {
        _count: {
          select: {
            steps: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    console.log('📊 Steps by aggregated step:');
    aggStepStats.forEach((aggStep) => {
      console.log(
        `   ${aggStep.code} - ${aggStep.name}: ${aggStep._count.steps} steps`
      );
    });
  } catch (error) {
    console.error('❌ Error seeding steps:', error);
    throw error;
  }
}

module.exports = { seedSteps };
