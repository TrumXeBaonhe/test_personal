const { Client } = require('pg');
const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

async function exportDatabase() {
  console.log('Starting database export...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Get Schema (using prisma migrate diff for better accuracy)
    console.log('Generating schema SQL...');
    const schemaSql = execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script', { encoding: 'utf8' });

    let finalSql = '-- Backup generated on ' + new Date().toISOString() + '\n';
    finalSql += 'SET session_replication_role = \'replica\';\n\n';
    finalSql += schemaSql + '\n\n';

    // 2. Get all tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma_migrations';
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables to export.`);

    for (const table of tables) {
      console.log(`Exporting data for table: ${table}...`);
      const dataRes = await client.query(`SELECT * FROM "${table}"`);
      
      if (dataRes.rows.length === 0) {
        continue;
      }

      const columns = dataRes.fields.map(f => f.name);
      
      for (const row of dataRes.rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        });

        finalSql += `INSERT INTO "${table}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
      }
      finalSql += '\n';
    }

    finalSql += 'SET session_replication_role = \'origin\';\n';

    fs.writeFileSync('backup.sql', finalSql);
    console.log('Export complete! backup.sql has been created.');

  } catch (err) {
    console.error('Error during export:', err);
  } finally {
    await client.end();
  }
}

exportDatabase();
