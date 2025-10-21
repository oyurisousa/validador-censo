const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedMunicipalities() {
  console.log('🌱 Seeding UFs and municipalities...');

  // Path to the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'municipalities.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    console.log('Please place the municipalities CSV file at:', csvPath);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Skip header line
    const dataLines = lines.slice(1).filter((line) => line.trim().length > 0);

    console.log(`📊 Found ${dataLines.length} records to process`);

    // Clear existing data (municipalities will be deleted by cascade)
    await prisma.municipality.deleteMany();
    await prisma.uF.deleteMany();
    console.log('🗑️ Cleared existing data');

    // Parse CSV and organize data
    const ufsMap = new Map();
    const municipalities = [];

    for (const line of dataLines) {
      // Split by semicolon (CSV separator used in the file)
      const columns = line.split(';');

      if (columns.length >= 4) {
        const ufCode = columns[0]?.trim();
        const ufName = columns[1]?.trim();
        const municipalityCode = columns[2]?.trim();
        const municipalityName = columns[3]?.trim();

        if (ufCode && ufName && municipalityCode && municipalityName) {
          // Add UF to map (will only keep unique entries)
          if (!ufsMap.has(ufCode)) {
            ufsMap.set(ufCode, { code: ufCode, name: ufName });
          }

          // Add municipality
          municipalities.push({
            code: municipalityCode,
            name: municipalityName,
            ufCode: ufCode,
          });
        }
      }
    }

    // Insert UFs first
    console.log(`📍 Creating ${ufsMap.size} UFs...`);
    const ufsToCreate = Array.from(ufsMap.values());

    await prisma.uF.createMany({
      data: ufsToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${ufsToCreate.length} UFs`);

    // Insert municipalities in batches
    console.log(`📍 Creating ${municipalities.length} municipalities...`);
    const batchSize = 100;

    for (let i = 0; i < municipalities.length; i += batchSize) {
      const batch = municipalities.slice(i, i + batchSize);
      const municipalitiesToCreate = batch.map((municipality) => ({
        code: municipality.code,
        name: municipality.name,
        ufCode: municipality.ufCode,
      }));

      await prisma.municipality.createMany({
        data: municipalitiesToCreate,
        skipDuplicates: true,
      });

      console.log(
        `📍 Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(municipalities.length / batchSize)}`
      );
    }

    console.log(`✅ Successfully imported ${municipalities.length} municipalities`);

    // Show some stats
    const totalUFs = await prisma.uF.count();
    const totalMunicipalities = await prisma.municipality.count();

    console.log(`📈 Total UFs in database: ${totalUFs}`);
    console.log(`📈 Total municipalities in database: ${totalMunicipalities}`);

    // Show municipalities by UF
    const ufStats = await prisma.uF.findMany({
      include: {
        _count: {
          select: {
            municipalities: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    console.log('📊 Municipalities by UF:');
    ufStats.forEach((uf) => {
      console.log(`   ${uf.code} - ${uf.name}: ${uf._count.municipalities} municipalities`);
    });
  } catch (error) {
    console.error('❌ Error seeding municipalities:', error);
    throw error;
  }
}

module.exports = { seedMunicipalities };
