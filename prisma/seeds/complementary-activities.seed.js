const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedComplementaryActivities() {
  console.log('🌱 Seeding complementary activities...');

  // Path to the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'complementary_activity.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Skip header line
    const dataLines = lines.slice(1).filter((line) => line.trim().length > 0);

    console.log(`📊 Found ${dataLines.length} records to process`);

    // Clear existing data (cascade will delete related records)
    await prisma.complementaryActivity.deleteMany();
    await prisma.subArea.deleteMany();
    await prisma.area.deleteMany();
    console.log('🗑️ Cleared existing data');

    // Parse CSV and organize data
    const areasMap = new Map();
    const subAreasMap = new Map();
    const activities = [];

    let currentAreaCode = '';
    let currentAreaName = '';
    let currentSubAreaCode = '';
    let currentSubAreaName = '';

    for (const line of dataLines) {
      // Split by semicolon (CSV separator)
      const columns = line.split(';');

      if (columns.length >= 4) {
        const areaField = columns[0]?.trim() || '';
        const subAreaField = columns[1]?.trim() || '';
        const activityCode = columns[2]?.trim();
        const activityName = columns[3]?.trim();

        // Update current area if present
        if (areaField) {
          const areaMatch = areaField.match(/^(\d+[\.]?)\.\s*(.+)$/);
          if (areaMatch) {
            currentAreaCode = areaMatch[1].replace('.', '').trim();
            currentAreaName = areaMatch[2].trim();

            if (!areasMap.has(currentAreaCode)) {
              areasMap.set(currentAreaCode, {
                code: currentAreaCode,
                name: currentAreaName,
              });
            }
          }
        }

        // Update current subarea if present
        if (subAreaField) {
          const subAreaMatch = subAreaField.match(/^(\d+)\.\s*(.+)$/);
          if (subAreaMatch) {
            currentSubAreaCode = subAreaMatch[1].trim();
            currentSubAreaName = subAreaMatch[2].trim();

            if (!subAreasMap.has(currentSubAreaCode)) {
              subAreasMap.set(currentSubAreaCode, {
                code: currentSubAreaCode,
                name: currentSubAreaName,
                areaCode: currentAreaCode,
              });
            }
          }
        }

        // Add activity if code and name are present
        if (activityCode && activityName) {
          activities.push({
            code: activityCode,
            name: activityName,
            areaCode: currentAreaCode,
            subAreaCode: currentSubAreaCode,
          });
        }
      }
    }

    // Insert Areas first
    console.log(`📍 Creating ${areasMap.size} areas...`);
    const areasToCreate = Array.from(areasMap.values());

    await prisma.area.createMany({
      data: areasToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${areasToCreate.length} areas`);

    // Insert SubAreas
    console.log(`📍 Creating ${subAreasMap.size} sub-areas...`);
    const subAreasToCreate = Array.from(subAreasMap.values());

    await prisma.subArea.createMany({
      data: subAreasToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${subAreasToCreate.length} sub-areas`);

    // Insert Activities in batches
    console.log(`📍 Creating ${activities.length} complementary activities...`);
    const batchSize = 100;

    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);

      await prisma.complementaryActivity.createMany({
        data: batch,
        skipDuplicates: true,
      });

      console.log(
        `📍 Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(activities.length / batchSize)}`
      );
    }

    console.log(`✅ Successfully imported ${activities.length} complementary activities`);

    // Show some stats
    const totalAreas = await prisma.area.count();
    const totalSubAreas = await prisma.subArea.count();
    const totalActivities = await prisma.complementaryActivity.count();

    console.log(`📈 Total areas in database: ${totalAreas}`);
    console.log(`📈 Total sub-areas in database: ${totalSubAreas}`);
    console.log(`📈 Total activities in database: ${totalActivities}`);

    // Show activities by area
    const areaStats = await prisma.area.findMany({
      include: {
        _count: {
          select: {
            subAreas: true,
            complementaryActivities: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    console.log('📊 Activities by area:');
    areaStats.forEach((area) => {
      console.log(
        `   ${area.code} - ${area.name}: ${area._count.subAreas} sub-areas, ${area._count.complementaryActivities} activities`
      );
    });
  } catch (error) {
    console.error('❌ Error seeding complementary activities:', error);
    throw error;
  }
}

module.exports = { seedComplementaryActivities };
