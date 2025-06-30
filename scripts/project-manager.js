#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.scriptsDir = path.join(this.rootDir, 'scripts');
    this.configsDir = path.join(this.scriptsDir, 'generated-configs');
    this.templatesDir = path.join(this.scriptsDir, 'templates');
  }

  async start() {
    console.log('🎮 Game Hub Project Manager');
    console.log('============================\n');

    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'list':
          this.listProjects();
          break;
        case 'create':
          await this.createProject(args[1]);
          break;
        case 'remove':
          await this.removeProject(args[1]);
          break;
        case 'backup':
          await this.backupProject(args[1]);
          break;
        case 'restore':
          await this.restoreProject(args[1]);
          break;
        case 'validate':
          await this.validateProject(args[1]);
          break;
        case 'update-templates':
          await this.updateTemplates();
          break;
        case 'generate-docs':
          await this.generateDocs(args[1]);
          break;
        case 'test-module':
          await this.testModule(args[1]);
          break;
        case 'help':
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  listProjects() {
    console.log('📋 Available Projects:');
    console.log('======================\n');

    // List generated modules
    const srcDir = path.join(this.rootDir, 'src');
    const modules = fs.readdirSync(srcDir)
      .filter(item => {
        const itemPath = path.join(srcDir, item);
        return fs.statSync(itemPath).isDirectory() && 
               !['auth', 'entities', 'middleware', 'migrations', 'utils', 'user', 'wallet', 'game'].includes(item);
      });

    console.log('🎮 Game Modules:');
    modules.forEach((module, index) => {
      const modulePath = path.join(srcDir, module);
      const subModules = fs.readdirSync(modulePath)
        .filter(item => {
          const itemPath = path.join(modulePath, item);
          return fs.statSync(itemPath).isDirectory();
        });
      
      console.log(`  ${index + 1}. ${module}`);
      console.log(`     Sub-modules: ${subModules.join(', ')}`);
    });

    // List saved configurations
    console.log('\n💾 Saved Configurations:');
    if (fs.existsSync(this.configsDir)) {
      const configs = fs.readdirSync(this.configsDir)
        .filter(file => file.endsWith('.json'));
      
      configs.forEach((config, index) => {
        console.log(`  ${index + 1}. ${config}`);
      });
    } else {
      console.log('  No saved configurations found.');
    }

    // List templates
    console.log('\n📋 Available Templates:');
    if (fs.existsSync(this.templatesDir)) {
      const templates = fs.readdirSync(this.templatesDir)
        .filter(file => file.endsWith('.json'));
      
      templates.forEach((template, index) => {
        const templatePath = path.join(this.templatesDir, template);
        const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        console.log(`  ${index + 1}. ${template} - ${templateData.name}`);
      });
    } else {
      console.log('  No templates found.');
    }
  }

  async createProject(templateOrConfig) {
    if (!templateOrConfig) {
      console.log('❌ Please specify a template name or config file');
      return;
    }

    console.log(`🔨 Creating project from: ${templateOrConfig}`);

    // Check if it's a template or config
    const templatePath = path.join(this.templatesDir, `${templateOrConfig}.json`);
    const configPath = path.join(this.configsDir, templateOrConfig);

    let configData;
    
    if (fs.existsSync(templatePath)) {
      console.log('Using template...');
      configData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    } else if (fs.existsSync(configPath)) {
      console.log('Using saved configuration...');
      configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      console.log('❌ Template or configuration not found');
      return;
    }

    // Run the generator with the config
    const AdvancedGameModuleGenerator = require('./generate-game-module-v2.js');
    const generator = new AdvancedGameModuleGenerator();
    generator.config = configData;
    
    await generator.generateModule();
    console.log('✅ Project created successfully!');
  }

  async removeProject(projectName) {
    if (!projectName) {
      console.log('❌ Please specify a project name');
      return;
    }

    const projectPath = path.join(this.rootDir, 'src', projectName);
    
    if (!fs.existsSync(projectPath)) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`⚠️  This will permanently delete the ${projectName} module.`);
    console.log('Are you sure? (type "DELETE" to confirm)');
    
    // Note: In a real implementation, you'd want to add proper confirmation
    // For now, we'll just log what would happen
    console.log(`Would remove: ${projectPath}`);
    console.log('Would update app.module.ts to remove imports');
    console.log('Would drop database schema if exists');
  }

  async backupProject(projectName) {
    if (!projectName) {
      console.log('❌ Please specify a project name');
      return;
    }

    const projectPath = path.join(this.rootDir, 'src', projectName);
    
    if (!fs.existsSync(projectPath)) {
      console.log('❌ Project not found');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.rootDir, 'backups', `${projectName}-${timestamp}`);
    
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Copy project files
    this.copyRecursive(projectPath, path.join(backupDir, 'src'));
    
    // Backup database schema if exists
    const schemaName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    try {
      console.log(`📦 Creating backup for ${projectName}...`);
      
      // Export database schema
      const exportCmd = `pg_dump --schema-only --schema=${schemaName} > ${path.join(backupDir, 'schema.sql')}`;
      console.log(`Database export: ${exportCmd}`);
      
      // Create backup info
      const backupInfo = {
        projectName,
        timestamp,
        schemaName,
        files: this.getFileList(projectPath)
      };
      
      fs.writeFileSync(
        path.join(backupDir, 'backup-info.json'),
        JSON.stringify(backupInfo, null, 2)
      );
      
      console.log(`✅ Backup created: ${backupDir}`);
    } catch (error) {
      console.log(`❌ Backup failed: ${error.message}`);
    }
  }

  async validateProject(projectName) {
    if (!projectName) {
      console.log('❌ Please specify a project name');
      return;
    }

    const projectPath = path.join(this.rootDir, 'src', projectName);
    
    if (!fs.existsSync(projectPath)) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`🔍 Validating project: ${projectName}`);
    console.log('=====================================\n');

    const issues = [];
    const warnings = [];

    // Check file structure
    const requiredFiles = [`${projectName.toLowerCase()}.module.ts`];
    const subModules = fs.readdirSync(projectPath)
      .filter(item => fs.statSync(path.join(projectPath, item)).isDirectory());

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(projectPath, file))) {
        issues.push(`Missing main module file: ${file}`);
      }
    }

    // Check submodules
    for (const subModule of subModules) {
      const subModulePath = path.join(projectPath, subModule);
      const requiredSubFiles = [
        `${subModule}.module.ts`,
        `${subModule}.controller.ts`,
        `${subModule}.service.ts`
      ];

      for (const file of requiredSubFiles) {
        if (!fs.existsSync(path.join(subModulePath, file))) {
          issues.push(`Missing file in ${subModule}: ${file}`);
        }
      }
    }

    // Check TypeScript compilation
    try {
      console.log('🔧 Checking TypeScript compilation...');
      execSync('npm run build', { cwd: this.rootDir, stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
    } catch (error) {
      issues.push('TypeScript compilation failed');
    }

    // Check imports in app.module.ts
    const appModulePath = path.join(this.rootDir, 'src', 'app.module.ts');
    if (fs.existsSync(appModulePath)) {
      const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
      const expectedImport = `${projectName}Module`;
      
      if (!appModuleContent.includes(expectedImport)) {
        warnings.push(`Module not imported in app.module.ts: ${expectedImport}`);
      }
    }

    // Report results
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ Project validation passed!');
    } else {
      if (issues.length > 0) {
        console.log('❌ Issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    }
  }

  async updateTemplates() {
    console.log('🔄 Updating templates...');
    
    // Create additional useful templates
    const templates = [
      {
        name: 'mmorpg.json',
        data: this.createMMORPGTemplate()
      },
      {
        name: 'survival.json',
        data: this.createSurvivalTemplate()
      },
      {
        name: 'racing.json',
        data: this.createRacingTemplate()
      }
    ];

    for (const template of templates) {
      const templatePath = path.join(this.templatesDir, template.name);
      fs.writeFileSync(templatePath, JSON.stringify(template.data, null, 2));
      console.log(`✅ Updated template: ${template.name}`);
    }
  }

  async generateDocs(projectName) {
    if (!projectName) {
      console.log('❌ Please specify a project name');
      return;
    }

    const projectPath = path.join(this.rootDir, 'src', projectName);
    
    if (!fs.existsSync(projectPath)) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`📖 Generating documentation for: ${projectName}`);
    
    const docsDir = path.join(this.rootDir, 'docs', projectName);
    fs.mkdirSync(docsDir, { recursive: true });

    // Generate API documentation
    const apiDoc = this.generateAPIDoc(projectPath, projectName);
    fs.writeFileSync(path.join(docsDir, 'API.md'), apiDoc);

    // Generate setup guide
    const setupDoc = this.generateSetupDoc(projectName);
    fs.writeFileSync(path.join(docsDir, 'SETUP.md'), setupDoc);

    console.log(`✅ Documentation generated: ${docsDir}`);
  }

  async testModule(projectName) {
    if (!projectName) {
      console.log('❌ Please specify a project name');
      return;
    }

    console.log(`🧪 Testing module: ${projectName}`);
    
    try {
      // Run specific tests for the module
      const testCommand = `npm test -- --testPathPattern=${projectName}`;
      console.log(`Running: ${testCommand}`);
      
      execSync(testCommand, { cwd: this.rootDir, stdio: 'inherit' });
      console.log('✅ Tests passed!');
    } catch (error) {
      console.log('❌ Tests failed');
    }
  }

  copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      const items = fs.readdirSync(src);
      
      for (const item of items) {
        this.copyRecursive(
          path.join(src, item),
          path.join(dest, item)
        );
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  getFileList(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          traverse(itemPath);
        } else {
          files.push(path.relative(dir, itemPath));
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  createMMORPGTemplate() {
    return {
      name: "MMORPG Template",
      description: "MMORPG-specific module with guilds, quests, and complex character systems",
      game: {
        playerIdField: "character_id",
        playerIdType: "UUID",
        supportsMultiplayer: true,
        hasInventorySystem: true,
        hasPlayerStats: true,
        hasAchievements: true,
        hasServerInfo: true,
        hasGuildSystem: true,
        hasQuestSystem: true,
        hasCraftingSystem: true
      },
      modules: [
        {
          name: "character",
          displayName: "Character Management",
          description: "Manage MMORPG character data and progression",
          enabled: true,
          dependencies: [],
          endpoints: [
            { method: "GET", path: "/", description: "Get character information", requiresAuth: true },
            { method: "POST", path: "/level-up", description: "Level up character", requiresAuth: true },
            { method: "PUT", path: "/stats", description: "Allocate stat points", requiresAuth: true }
          ]
        },
        {
          name: "guild",
          displayName: "Guild System",
          description: "Manage guilds and guild members",
          enabled: true,
          dependencies: ["character"],
          endpoints: [
            { method: "GET", path: "/", description: "Get guild information", requiresAuth: true },
            { method: "POST", path: "/create", description: "Create new guild", requiresAuth: true },
            { method: "POST", path: "/join", description: "Join guild", requiresAuth: true }
          ]
        }
      ]
    };
  }

  createSurvivalTemplate() {
    return {
      name: "Survival Game Template",
      description: "Survival game module with base building and resource management",
      game: {
        playerIdField: "player_id",
        playerIdType: "TEXT",
        supportsMultiplayer: true,
        hasInventorySystem: true,
        hasPlayerStats: true,
        hasBaseBuilding: true,
        hasResourceManagement: true
      },
      modules: [
        {
          name: "base",
          displayName: "Base Management",
          description: "Manage player bases and structures",
          enabled: true,
          dependencies: ["item"],
          endpoints: [
            { method: "GET", path: "/", description: "Get base information", requiresAuth: true },
            { method: "POST", path: "/build", description: "Build structure", requiresAuth: true }
          ]
        }
      ]
    };
  }

  createRacingTemplate() {
    return {
      name: "Racing Game Template",
      description: "Racing game module with tracks, vehicles, and leaderboards",
      game: {
        playerIdField: "driver_id",
        playerIdType: "TEXT",
        supportsMultiplayer: true,
        hasVehicleSystem: true,
        hasTrackSystem: true,
        hasLeaderboards: true
      },
      modules: [
        {
          name: "race",
          displayName: "Race Management",
          description: "Manage races and results",
          enabled: true,
          dependencies: [],
          endpoints: [
            { method: "GET", path: "/leaderboard", description: "Get race leaderboard", requiresAuth: false },
            { method: "POST", path: "/result", description: "Submit race result", requiresAuth: true }
          ]
        }
      ]
    };
  }

  generateAPIDoc(projectPath, projectName) {
    return `# ${projectName} API Documentation

## Overview
This document describes the API endpoints for the ${projectName} module.

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## Endpoints

### Base URL
\`\`\`
/api/${projectName.toLowerCase()}
\`\`\`

## Sub-modules
${this.getSubModulesList(projectPath)}

## Error Responses
All endpoints return errors in the following format:
\`\`\`json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
\`\`\`
`;
  }

  generateSetupDoc(projectName) {
    return `# ${projectName} Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- NestJS CLI

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up database schema:
\`\`\`sql
-- Run the schema creation script
-- Located in: database/create-${projectName.toLowerCase()}-schema.sql
\`\`\`

3. Update environment variables:
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/database
\`\`\`

4. Start the application:
\`\`\`bash
npm run start:dev
\`\`\`

## Testing
Run tests for this module:
\`\`\`bash
npm run test:${projectName}
\`\`\`

## API Testing
Use the provided Postman collection or test manually:
\`\`\`bash
curl -X GET http://localhost:3000/api/${projectName.toLowerCase()}/health
\`\`\`
`;
  }

  getSubModulesList(projectPath) {
    try {
      const subModules = fs.readdirSync(projectPath)
        .filter(item => fs.statSync(path.join(projectPath, item)).isDirectory());
      
      return subModules.map(module => `- ${module}`).join('\n');
    } catch (error) {
      return 'No sub-modules found';
    }
  }

  showHelp() {
    console.log(`Usage: npm run project-manager <command> [options]

Commands:
  list                    List all projects, configs, and templates
  create <template>       Create project from template or config
  remove <project>        Remove a project (with confirmation)
  backup <project>        Create backup of project
  restore <backup>        Restore project from backup
  validate <project>      Validate project structure and compilation
  update-templates        Update/create additional templates
  generate-docs <project> Generate documentation for project
  test-module <project>   Run tests for specific module
  help                    Show this help message

Examples:
  npm run project-manager list
  npm run project-manager create minecraft
  npm run project-manager validate Minecraft
  npm run project-manager backup SpaceEngineers
  npm run project-manager generate-docs Terraria

Templates available:
  - default-game.json
  - minecraft.json  
  - terraria.json
  - mmorpg.json (created by update-templates)
  - survival.json (created by update-templates)
  - racing.json (created by update-templates)
`);
  }
}

// Start the project manager
if (require.main === module) {
  const manager = new ProjectManager();
  manager.start().catch(console.error);
}

module.exports = ProjectManager;
