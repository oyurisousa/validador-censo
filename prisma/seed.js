const { PrismaClient } = require('@prisma/client');

// Import seed functions
const { seedMunicipalities } = require('./seeds/municipalities.seed');
const { seedComplementaryActivities } = require('./seeds/complementary-activities.seed');
const { seedSteps } = require('./seeds/steps.seed');
const { seedKnowledgeAreas } = require('./seeds/knowledge-areas.seed');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Seed municipalities and UFs
    await seedMunicipalities();
    console.log('\n');

    // Seed complementary activities (areas, sub-areas, and activities)
    await seedComplementaryActivities();
    console.log('\n');

    // Seed steps (aggregated steps and steps)
    await seedSteps();
    console.log('\n');

    // Seed knowledge areas (categories and areas)
    await seedKnowledgeAreas();
    console.log('\n');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();