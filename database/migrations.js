const database = require('./connection');
const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor() {
    this.db = database;
  }

  async reset() {
    console.log('🔄 Resetting database...');
    try {
      await this.db.connect();
      
      // Drop all tables
      const tables = [
        'notifications', 'transactions', 'ratings', 'messages', 
        'exchanges', 'user_skills_wanted', 'user_skills_offered', 
        'skills', 'users'
      ];
      
      for (const table of tables) {
        try {
          await this.db.run(`DROP TABLE IF EXISTS ${table}`);
        } catch (error) {
          console.log(`Table ${table} may not exist, continuing...`);
        }
      }
      
      // Recreate tables
      await this.db.createTables();
      
      // Seed initial data
      await this.seed();
      
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  async migrate() {
    console.log('🔄 Running migrations...');
    try {
      await this.db.connect();
      await this.db.createTables();
      console.log('✅ Migrations completed');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async seed() {
    console.log('🌱 Seeding database...');
    try {
      // Insert sample skills
      const skills = [
        { id: '1', skillID: 'programming', name: 'Programming', category: 'Technology', skillLevel: 'Intermediate' },
        { id: '2', skillID: 'cooking', name: 'Cooking', category: 'Lifestyle', skillLevel: 'Beginner' },
        { id: '3', skillID: 'photography', name: 'Photography', category: 'Arts', skillLevel: 'Advanced' },
        { id: '4', skillID: 'guitar', name: 'Guitar', category: 'Music', skillLevel: 'Intermediate' },
        { id: '5', skillID: 'spanish', name: 'Spanish Language', category: 'Language', skillLevel: 'Beginner' },
        { id: '6', skillID: 'yoga', name: 'Yoga', category: 'Fitness', skillLevel: 'Intermediate' },
        { id: '7', skillID: 'web-design', name: 'Web Design', category: 'Technology', skillLevel: 'Advanced' },
        { id: '8', skillID: 'gardening', name: 'Gardening', category: 'Lifestyle', skillLevel: 'Beginner' }
      ];

      for (const skill of skills) {
        await this.db.run(
          `INSERT OR IGNORE INTO skills (id, skillID, name, category, skillLevel) VALUES (?, ?, ?, ?, ?)`,
          [skill.id, skill.skillID, skill.name, skill.category, skill.skillLevel]
        );
      }

      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const migrationManager = new MigrationManager();

  switch (command) {
    case 'reset':
      migrationManager.reset().then(() => process.exit(0));
      break;
    case 'migrate':
      migrationManager.migrate().then(() => process.exit(0));
      break;
    case 'seed':
      migrationManager.seed().then(() => process.exit(0));
      break;
    default:
      console.log('Usage: node migrations.js [reset|migrate|seed]');
      process.exit(1);
  }
}

module.exports = MigrationManager;

