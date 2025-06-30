#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class AdvancedGameModuleGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {};
    this.templatesDir = path.join(__dirname, 'templates');
    this.outputDir = path.join(__dirname, '..', 'src');
  }

  async start() {
    console.log('🎮 Advanced Game Hub Module Generator v2.0');
    console.log('==============================================\n');

    try {
      // Show available templates
      await this.showAvailableTemplates();
      
      // Let user choose generation method
      const useTemplate = await this.askQuestion('Use existing template? (y/n): ');
      
      if (useTemplate.toLowerCase() === 'y') {
        await this.generateFromTemplate();
      } else {
        await this.generateCustom();
      }
      
      // Preview configuration
      await this.previewConfiguration();
      
      // Validate configuration
      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        console.log('\n❌ Configuration validation failed:');
        validation.errors.forEach(error => console.log(`  - ${error}`));
        return;
      }
      
      // Generate or just preview
      const action = await this.askQuestion('\n🔧 What would you like to do?\n1. Generate module\n2. Save configuration only\n3. Preview files\nChoice (1-3): ');
      
      switch (action) {
        case '1':
          await this.generateModule();
          console.log('\n🎉 Module generated successfully!');
          break;
        case '2':
          await this.saveConfiguration();
          console.log('\n💾 Configuration saved!');
          break;
        case '3':
          await this.previewFiles();
          break;
        default:
          console.log('\n❌ Invalid choice.');
      }
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async showAvailableTemplates() {
    console.log('📋 Available Templates:');
    console.log('=======================');
    
    try {
      const files = fs.readdirSync(this.templatesDir);
      const templates = files.filter(file => file.endsWith('.json'));
      
      for (let i = 0; i < templates.length; i++) {
        const templatePath = path.join(this.templatesDir, templates[i]);
        const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        console.log(`${i + 1}. ${template.name}`);
        console.log(`   ${template.description}`);
        console.log(`   File: ${templates[i]}`);
        console.log('');
      }
    } catch (error) {
      console.log('No templates found or error reading templates directory.');
    }
  }

  async generateFromTemplate() {
    const templateName = await this.askQuestion('Enter template name (without .json): ');
    const templatePath = path.join(this.templatesDir, `${templateName}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}.json`);
    }
    
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Allow customization of template
    console.log(`\n🎯 Using template: ${template.name}`);
    
    this.config.game = {
      ...template.game,
      name: await this.askQuestion('Game name: ') || templateName,
      displayName: await this.askQuestion('Display name: ') || template.name,
      version: await this.askQuestion('Game version: ') || 'latest',
      description: await this.askQuestion('Description: ') || template.description
    };
    
    // Generate module and schema names
    this.config.game.moduleName = this.config.game.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^\w/, c => c.toUpperCase());
    
    this.config.game.schemaName = this.config.game.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    
    // Allow module customization
    this.config.modules = [];
    for (const templateModule of template.modules) {
      const includeModule = await this.askQuestion(`Include ${templateModule.name} module? (y/n): `);
      if (includeModule.toLowerCase() === 'y') {
        this.config.modules.push(templateModule);
      }
    }
    
    // Database configuration
    this.config.database = template.database;
    this.config.features = template.features;
  }

  async generateCustom() {
    await this.collectGameInfo();
    await this.collectModuleInfo();
    await this.collectDatabaseInfo();
    await this.collectFeatureInfo();
  }

  async collectGameInfo() {
    console.log('\n🎮 Game Information:');
    this.config.game = {
      name: await this.askQuestion('Game name (e.g., Minecraft, Terraria): '),
      displayName: await this.askQuestion('Display name (e.g., Minecraft Java Edition): '),
      version: await this.askQuestion('Game version (optional): ') || 'latest',
      description: await this.askQuestion('Game description (optional): ') || '',
      playerIdField: await this.askQuestion('Player ID field name (default: player_id): ') || 'player_id',
      playerIdType: await this.askQuestion('Player ID type (TEXT/UUID/INTEGER): ') || 'TEXT',
      supportsMultiplayer: (await this.askQuestion('Supports multiplayer? (y/n): ')).toLowerCase() === 'y',
      hasInventorySystem: (await this.askQuestion('Has inventory system? (y/n): ')).toLowerCase() === 'y',
      hasPlayerStats: (await this.askQuestion('Has player stats? (y/n): ')).toLowerCase() === 'y',
      hasAchievements: (await this.askQuestion('Has achievements? (y/n): ')).toLowerCase() === 'y',
      hasServerInfo: (await this.askQuestion('Has server info? (y/n): ')).toLowerCase() === 'y'
    };

    // Generate module name from game name
    this.config.game.moduleName = this.config.game.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^\w/, c => c.toUpperCase());
    
    this.config.game.schemaName = this.config.game.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
  }

  async collectModuleInfo() {
    console.log('\n📦 Module Configuration:');
    
    const modules = [];
    const defaultModules = ['item', 'player-stats', 'server-info'];
    
    console.log('Available default modules: ' + defaultModules.join(', '));
    const useDefaults = await this.askQuestion('Use default modules? (y/n): ');
    
    if (useDefaults.toLowerCase() === 'y') {
      modules.push(...defaultModules);
    } else {
      console.log('Enter custom modules (comma-separated): ');
      const customModules = await this.askQuestion('Modules: ');
      modules.push(...customModules.split(',').map(m => m.trim()));
    }

    this.config.modules = [];
    
    for (const moduleName of modules) {
      console.log(`\n🔧 Configuring ${moduleName} module:`);
      const moduleConfig = {
        name: moduleName,
        displayName: await this.askQuestion(`Display name for ${moduleName}: `) || moduleName,
        description: await this.askQuestion(`Description for ${moduleName}: `) || '',
        enabled: true,
        dependencies: [],
        endpoints: []
      };

      const hasEndpoints = await this.askQuestion('Add custom endpoints? (y/n): ');
      if (hasEndpoints.toLowerCase() === 'y') {
        await this.collectEndpoints(moduleConfig);
      } else {
        // Add default endpoints based on module type
        moduleConfig.endpoints = this.getDefaultEndpoints(moduleName);
      }

      // Collect dependencies
      const hasDependencies = await this.askQuestion('Has dependencies on other modules? (y/n): ');
      if (hasDependencies.toLowerCase() === 'y') {
        const deps = await this.askQuestion('Dependencies (comma-separated): ');
        moduleConfig.dependencies = deps.split(',').map(d => d.trim()).filter(d => d);
      }

      this.config.modules.push(moduleConfig);
    }
  }

  async collectEndpoints(moduleConfig) {
    console.log('Enter endpoints (format: METHOD:/path - description. Empty line to finish):');
    
    while (true) {
      const endpoint = await this.askQuestion('Endpoint: ');
      if (!endpoint.trim()) break;
      
      const parts = endpoint.split(' - ');
      const [methodPath, description] = parts;
      const [method, path] = methodPath.split(':');
      
      if (method && path) {
        const endpointConfig = {
          method: method.toUpperCase(),
          path: path.trim(),
          description: description || '',
          requiresAuth: (await this.askQuestion(`Requires auth for ${method}:${path}? (y/n): `)).toLowerCase() === 'y',
          rateLimited: (await this.askQuestion(`Rate limited? (y/n): `)).toLowerCase() === 'y'
        };
        
        if (endpointConfig.rateLimited) {
          endpointConfig.rateLimit = {
            windowMs: parseInt(await this.askQuestion('Rate limit window (ms, default 60000): ')) || 60000,
            maxRequests: parseInt(await this.askQuestion('Max requests per window (default 100): ')) || 100
          };
        }
        
        const adminOnly = await this.askQuestion('Admin only? (y/n): ');
        if (adminOnly.toLowerCase() === 'y') {
          endpointConfig.adminOnly = true;
        }
        
        moduleConfig.endpoints.push(endpointConfig);
      }
    }
  }

  async collectDatabaseInfo() {
    console.log('\n🗄️ Database Configuration:');
    
    this.config.database = {
      createSchema: (await this.askQuestion('Create new database schema? (y/n): ')).toLowerCase() === 'y',
      tables: []
    };

    if (this.config.database.createSchema) {
      console.log('\nTable configuration:');
      
      for (const module of this.config.modules) {
        console.log(`\n📊 Tables for ${module.name} module:`);
        const tables = this.getDefaultTables(module.name);
        
        for (const table of tables) {
          const useTable = await this.askQuestion(`Create ${table.name} table? (y/n): `);
          if (useTable.toLowerCase() === 'y') {
            const customFields = await this.askQuestion('Add custom fields? (y/n): ');
            if (customFields.toLowerCase() === 'y') {
              await this.customizeTable(table);
            }
            this.config.database.tables.push(table);
          }
        }
      }
    }
  }

  async collectFeatureInfo() {
    console.log('\n🔧 Feature Configuration:');
    
    this.config.features = {};
    
    // Authentication
    const authEnabled = await this.askQuestion('Enable authentication? (y/n): ');
    this.config.features.authentication = {
      enabled: authEnabled.toLowerCase() === 'y',
      methods: []
    };
    
    if (this.config.features.authentication.enabled) {
      const authMethods = await this.askQuestion('Auth methods (steam,jwt,custom - comma separated): ');
      this.config.features.authentication.methods = authMethods.split(',').map(m => m.trim());
    }
    
    // Rate limiting
    const rateLimitEnabled = await this.askQuestion('Enable rate limiting? (y/n): ');
    this.config.features.rateLimit = {
      enabled: rateLimitEnabled.toLowerCase() === 'y'
    };
    
    if (this.config.features.rateLimit.enabled) {
      this.config.features.rateLimit.defaultWindow = parseInt(await this.askQuestion('Default window (ms, default 60000): ')) || 60000;
      this.config.features.rateLimit.defaultMax = parseInt(await this.askQuestion('Default max requests (default 100): ')) || 100;
    }
    
    // Admin panel
    const adminEnabled = await this.askQuestion('Enable admin panel? (y/n): ');
    this.config.features.adminPanel = {
      enabled: adminEnabled.toLowerCase() === 'y'
    };
    
    if (this.config.features.adminPanel.enabled) {
      const adminFeatures = await this.askQuestion('Admin features (comma-separated): ');
      this.config.features.adminPanel.features = adminFeatures.split(',').map(f => f.trim());
    }
    
    // WebSockets
    const wsEnabled = await this.askQuestion('Enable WebSockets? (y/n): ');
    this.config.features.websockets = {
      enabled: wsEnabled.toLowerCase() === 'y'
    };
    
    if (this.config.features.websockets.enabled) {
      const wsEvents = await this.askQuestion('WebSocket events (comma-separated): ');
      this.config.features.websockets.events = wsEvents.split(',').map(e => e.trim());
    }
  }

  async customizeTable(table) {
    console.log(`\nCustomizing ${table.name} table:`);
    console.log('Current fields:');
    table.fields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.name} (${field.type})`);
    });
    
    while (true) {
      const action = await this.askQuestion('\nActions: (a)dd field, (r)emove field, (m)odify field, (d)one: ');
      
      switch (action.toLowerCase()) {
        case 'a':
          const fieldName = await this.askQuestion('Field name: ');
          const fieldType = await this.askQuestion('Field type: ');
          table.fields.push({ name: fieldName, type: fieldType });
          break;
          
        case 'r':
          const removeIndex = parseInt(await this.askQuestion('Field number to remove: ')) - 1;
          if (removeIndex >= 0 && removeIndex < table.fields.length) {
            table.fields.splice(removeIndex, 1);
          }
          break;
          
        case 'm':
          const modifyIndex = parseInt(await this.askQuestion('Field number to modify: ')) - 1;
          if (modifyIndex >= 0 && modifyIndex < table.fields.length) {
            const field = table.fields[modifyIndex];
            field.name = await this.askQuestion(`New name (current: ${field.name}): `) || field.name;
            field.type = await this.askQuestion(`New type (current: ${field.type}): `) || field.type;
          }
          break;
          
        case 'd':
          return;
      }
    }
  }

  async previewConfiguration() {
    console.log('\n📋 Configuration Preview:');
    console.log('=========================');
    console.log(JSON.stringify(this.config, null, 2));
  }

  validateConfiguration() {
    const errors = [];
    
    // Validate game info
    if (!this.config.game?.name) {
      errors.push('Game name is required');
    }
    
    if (!this.config.modules?.length) {
      errors.push('At least one module is required');
    }
    
    // Validate module dependencies
    if (this.config.modules) {
      const moduleNames = this.config.modules.map(m => m.name);
      for (const module of this.config.modules) {
        for (const dep of module.dependencies || []) {
          if (!moduleNames.includes(dep)) {
            errors.push(`Module '${module.name}' depends on '${dep}' which is not defined`);
          }
        }
      }
    }
    
    // Validate database schema name
    if (this.config.game?.schemaName && !/^[a-z_][a-z0-9_]*$/.test(this.config.game.schemaName)) {
      errors.push('Schema name must be a valid PostgreSQL identifier');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async saveConfiguration() {
    const configPath = path.join(__dirname, 'generated-configs', `${this.config.game.name}-config.json`);
    
    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log(`Configuration saved to: ${configPath}`);
  }

  async previewFiles() {
    console.log('\n📄 File Preview:');
    console.log('=================');
    
    // Preview main module file
    console.log(`\n1. src/${this.config.game.moduleName}/${this.config.game.name.toLowerCase()}.module.ts`);
    console.log(this.generateMainModuleContent());
    
    // Preview one submodule
    if (this.config.modules.length > 0) {
      const firstModule = this.config.modules[0];
      console.log(`\n2. src/${this.config.game.moduleName}/${firstModule.name}/${firstModule.name}.service.ts`);
      console.log(this.generateServiceContent(firstModule));
    }
    
    // Preview SQL
    if (this.config.database.createSchema) {
      console.log(`\n3. SQL Schema Creation:`);
      console.log(this.generateSchemaSQL());
    }
  }

  getDefaultEndpoints(moduleName) {
    const defaults = {
      'item': [
        { method: 'GET', path: '/', description: 'Get user items', requiresAuth: true, rateLimited: false },
        { method: 'POST', path: '/upload', description: 'Upload item to storage', requiresAuth: true, rateLimited: true },
        { method: 'POST', path: '/request-download', description: 'Request item download', requiresAuth: true, rateLimited: true },
        { method: 'POST', path: '/confirm-download', description: 'Confirm item download', requiresAuth: true, rateLimited: true },
        { method: 'POST', path: '/update', description: 'Update items database', requiresAuth: true, rateLimited: true }
      ],
      'player-stats': [
        { method: 'GET', path: '/', description: 'Get player statistics', requiresAuth: true, rateLimited: false },
        { method: 'POST', path: '/update', description: 'Update player statistics', requiresAuth: true, rateLimited: true },
        { method: 'GET', path: '/leaderboard/:stat', description: 'Get leaderboard for specific stat', requiresAuth: false, rateLimited: false },
        { method: 'GET', path: '/achievements', description: 'Get player achievements', requiresAuth: true, rateLimited: false }
      ],
      'server-info': [
        { method: 'GET', path: '/', description: 'Get server information', requiresAuth: false, rateLimited: false },
        { method: 'POST', path: '/update', description: 'Update server status', requiresAuth: true, rateLimited: true, adminOnly: true },
        { method: 'GET', path: '/players', description: 'Get online players', requiresAuth: false, rateLimited: false },
        { method: 'GET', path: '/status', description: 'Get server status', requiresAuth: false, rateLimited: false }
      ]
    };
    
    return defaults[moduleName] || [];
  }

  getDefaultTables(moduleName) {
    const defaults = {
      'item': [
        {
          name: 'items',
          description: 'Game items master data',
          fields: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'item_id', type: 'TEXT NOT NULL UNIQUE' },
            { name: 'display_name', type: 'TEXT NOT NULL' },
            { name: 'description', type: 'TEXT' },
            { name: 'category', type: 'TEXT DEFAULT \'misc\'' },
            { name: 'rarity', type: 'TEXT DEFAULT \'common\'' },
            { name: 'max_stack_size', type: 'INTEGER DEFAULT 64' },
            { name: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' }
          ]
        },
        {
          name: 'online_storage',
          description: 'Player online storage',
          fields: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: `${this.config.game?.playerIdField || 'player_id'}`, type: `${this.config.game?.playerIdType || 'TEXT'} UNIQUE` },
            { name: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' }
          ]
        }
      ],
      'player-stats': [
        {
          name: 'player_stats',
          description: 'Player statistics',
          fields: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'user_id', type: 'INTEGER NOT NULL' },
            { name: `${this.config.game?.playerIdField || 'player_id'}`, type: `${this.config.game?.playerIdType || 'TEXT'} NOT NULL` },
            { name: 'level', type: 'INTEGER DEFAULT 1' },
            { name: 'experience', type: 'BIGINT DEFAULT 0' },
            { name: 'play_time_minutes', type: 'INTEGER DEFAULT 0' },
            { name: 'last_login', type: 'TIMESTAMP' },
            { name: 'last_logout', type: 'TIMESTAMP' },
            { name: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' }
          ]
        }
      ],
      'server-info': [
        {
          name: 'server_status',
          description: 'Server status and information',
          fields: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'server_name', type: 'TEXT NOT NULL' },
            { name: 'is_online', type: 'BOOLEAN DEFAULT false' },
            { name: 'player_count', type: 'INTEGER DEFAULT 0' },
            { name: 'max_players', type: 'INTEGER DEFAULT 100' },
            { name: 'version', type: 'TEXT' },
            { name: 'motd', type: 'TEXT' },
            { name: 'last_ping', type: 'TIMESTAMP' },
            { name: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' }
          ]
        }
      ]
    };
    
    return defaults[moduleName] || [];
  }

  generateMainModuleContent() {
    const imports = this.config.modules.map(module => 
      `import { ${this.toPascalCase(module.name)}Module } from './${module.name}/${module.name}.module';`
    ).join('\n');
    
    const modulesList = this.config.modules.map(module => 
      `    ${this.toPascalCase(module.name)}Module`
    ).join(',\n');
    
    return `import { Module } from '@nestjs/common';
${imports}

@Module({
  imports: [
${modulesList}
  ],
  exports: [
${modulesList}
  ],
})
export class ${this.config.game.moduleName}Module {}`;
  }

  generateServiceContent(moduleConfig) {
    const endpoints = moduleConfig.endpoints.map(endpoint => 
      `  // ${endpoint.method} ${endpoint.path} - ${endpoint.description}`
    ).join('\n');
    
    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${this.toPascalCase(moduleConfig.name)}Service {
  constructor() {}

${endpoints}
}`;
  }

  generateSchemaSQL() {
    let sql = `-- Create ${this.config.game.schemaName} schema\n`;
    sql += `CREATE SCHEMA IF NOT EXISTS ${this.config.game.schemaName};\n\n`;
    
    for (const table of this.config.database.tables) {
      sql += `-- Create ${table.name} table\n`;
      sql += `CREATE TABLE IF NOT EXISTS ${this.config.game.schemaName}.${table.name} (\n`;
      
      const fields = table.fields.map(field => `  ${field.name} ${field.type}`);
      sql += fields.join(',\n');
      sql += '\n);\n\n';
    }
    
    return sql;
  }

  toPascalCase(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  // ... (rest of the generation methods from the original file)
  async generateModule() {
    // Implementation from original file
    console.log('🔨 Generating module files...');
    
    // Create main module directory
    const moduleDir = path.join(this.outputDir, this.config.game.moduleName);
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // Generate main module file
    const mainModuleContent = this.generateMainModuleContent();
    const mainModuleFile = path.join(moduleDir, `${this.config.game.name.toLowerCase()}.module.ts`);
    fs.writeFileSync(mainModuleFile, mainModuleContent);

    // Generate submodules
    for (const module of this.config.modules) {
      await this.generateSubModule(moduleDir, module);
    }

    // Generate database schema
    if (this.config.database.createSchema) {
      await this.generateDatabaseSchema();
    }

    // Update app.module.ts
    await this.updateAppModule();
  }

  async generateSubModule(moduleDir, moduleConfig) {
    const subModuleDir = path.join(moduleDir, moduleConfig.name);
    if (!fs.existsSync(subModuleDir)) {
      fs.mkdirSync(subModuleDir, { recursive: true });
    }

    // Generate module file
    const moduleContent = this.generateSubModuleFile(moduleConfig);
    fs.writeFileSync(path.join(subModuleDir, `${moduleConfig.name}.module.ts`), moduleContent);

    // Generate controller file
    const controllerContent = this.generateControllerFile(moduleConfig);
    fs.writeFileSync(path.join(subModuleDir, `${moduleConfig.name}.controller.ts`), controllerContent);

    // Generate service file
    const serviceContent = this.generateServiceFile(moduleConfig);
    fs.writeFileSync(path.join(subModuleDir, `${moduleConfig.name}.service.ts`), serviceContent);
  }

  generateSubModuleFile(moduleConfig) {
    const className = this.toPascalCase(moduleConfig.name);
    
    return `import { Module } from '@nestjs/common';
import { ${className}Controller } from './${moduleConfig.name}.controller';
import { ${className}Service } from './${moduleConfig.name}.service';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}`;
  }

  generateControllerFile(moduleConfig) {
    const className = this.toPascalCase(moduleConfig.name);
    const endpoints = moduleConfig.endpoints.map(endpoint => {
      const decorators = [`@${endpoint.method}('${endpoint.path}')`];
      
      if (endpoint.requiresAuth) {
        decorators.push('@UseGuards(JwtAuthGuard)');
      }
      
      const methodName = this.getMethodName(endpoint.method, endpoint.path);
      
      return `  ${decorators.join('\n  ')}
  async ${methodName}() {
    // ${endpoint.description}
    return this.${moduleConfig.name}Service.${methodName}();
  }`;
    }).join('\n\n');

    return `import { Controller, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ${className}Service } from './${moduleConfig.name}.service';

@Controller('${this.config.game.name.toLowerCase()}/${moduleConfig.name}')
export class ${className}Controller {
  constructor(private readonly ${moduleConfig.name}Service: ${className}Service) {}

${endpoints}
}`;
  }

  generateServiceFile(moduleConfig) {
    const className = this.toPascalCase(moduleConfig.name);
    const methods = moduleConfig.endpoints.map(endpoint => {
      const methodName = this.getMethodName(endpoint.method, endpoint.path);
      
      return `  async ${methodName}() {
    // ${endpoint.description}
    // TODO: Implement ${methodName}
    throw new Error('Method not implemented');
  }`;
    }).join('\n\n');

    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className}Service {
  constructor() {}

${methods}
}`;
  }

  getMethodName(method, path) {
    const cleanPath = path.replace(/^\//, '').replace(/[\/:-]/g, '_').replace(/_+/g, '_');
    const methodPrefix = method.toLowerCase();
    
    if (!cleanPath || cleanPath === '_') {
      return methodPrefix === 'get' ? 'findAll' : methodPrefix;
    }
    
    return `${methodPrefix}${this.toPascalCase(cleanPath)}`;
  }

  async generateDatabaseSchema() {
    const sql = this.generateSchemaSQL();
    const sqlFile = path.join(__dirname, '..', 'database', `create-${this.config.game.schemaName}-schema.sql`);
    
    // Ensure directory exists
    const sqlDir = path.dirname(sqlFile);
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }
    
    fs.writeFileSync(sqlFile, sql);
    console.log(`Database schema saved to: ${sqlFile}`);
  }

  async updateAppModule() {
    const appModulePath = path.join(this.outputDir, 'app.module.ts');
    
    if (fs.existsSync(appModulePath)) {
      let content = fs.readFileSync(appModulePath, 'utf8');
      
      // Add import
      const importLine = `import { ${this.config.game.moduleName}Module } from './${this.config.game.moduleName}/${this.config.game.name.toLowerCase()}.module';`;
      
      if (!content.includes(importLine)) {
        // Find the last import and add after it
        const lastImportMatch = content.match(/^import.*?;$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          content = content.replace(lastImport, `${lastImport}\n${importLine}`);
        }
        
        // Add to imports array
        const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
        if (importsMatch) {
          const currentImports = importsMatch[1].trim();
          const newImports = currentImports 
            ? `${currentImports},\n    ${this.config.game.moduleName}Module`
            : `    ${this.config.game.moduleName}Module`;
          
          content = content.replace(
            /imports:\s*\[([\s\S]*?)\]/,
            `imports: [\n${newImports}\n  ]`
          );
        }
        
        fs.writeFileSync(appModulePath, content);
        console.log('Updated app.module.ts');
      }
    }
  }
}

// Start the generator
if (require.main === module) {
  const generator = new AdvancedGameModuleGenerator();
  generator.start().catch(console.error);
}

module.exports = AdvancedGameModuleGenerator;
