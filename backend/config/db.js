const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const env = require('./env');

const dbPath = path.isAbsolute(env.DB_PATH) 
  ? env.DB_PATH 
  : path.resolve(__dirname, '..', env.DB_PATH);

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, row) => {
      if (err) {
        console.error('Error checking schema existence:', err.message);
        return;
      }
      
      if (!row) {
        console.log('Database tables not found. Initializing database schema...');
        const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
        const seedPath = path.resolve(__dirname, '../../database/seed.sql');
        
        try {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          db.exec(schemaSql, (err) => {
            if (err) {
              console.error('Error applying database schema:', err.message);
              return;
            }
            console.log('Database schema applied successfully.');
            
            // Seed database
            if (fs.existsSync(seedPath)) {
              console.log('Seeding initial database content...');
              const seedSql = fs.readFileSync(seedPath, 'utf8');
              db.exec(seedSql, (err) => {
                if (err) {
                  console.error('Error seeding database:', err.message);
                } else {
                  console.log('Database seeded successfully.');
                }
              });
            }
          });
        } catch (fileErr) {
          console.error('Failed to read SQL initialization files:', fileErr.message);
        }
      } else {
        console.log('Database tables already exist. Skipping schema initialization.');
      }
    });
  });
}

module.exports = db;
