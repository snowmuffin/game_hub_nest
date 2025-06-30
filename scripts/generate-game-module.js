#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GameModuleGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {};
  }

  async start() {
    console.log('🎮 Game Hub Module Generator');
    console.log('===============================\n');

    try {
      await this.collectGameInfo();
      await this.collectModuleInfo();
      await this.collectDatabaseInfo();
      
      console.log('\n📋 Configuration Summary:');
      console.log(JSON.stringify(this.config, null, 2));
      
      const confirm = await this.askQuestion('\n✅ Generate module with this configuration? (y/n): ');
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        await this.generateModule();
        console.log('\n🎉 Module generated successfully!');
      } else {
        console.log('\n❌ Generation cancelled.');
      }
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async collectGameInfo() {
    console.log('🎮 Game Information:');
    this.config.game = {
      name: await this.askQuestion('Game name (e.g., Minecraft, Terraria): '),
      displayName: await this.askQuestion('Display name (e.g., Minecraft Java Edition): '),
      version: await this.askQuestion('Game version (optional): ') || 'latest',
      description: await this.askQuestion('Game description (optional): ') || '',
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
        endpoints: []
      };

      const hasEndpoints = await this.askQuestion('Add custom endpoints? (y/n): ');
      if (hasEndpoints.toLowerCase() === 'y') {
        await this.collectEndpoints(moduleConfig);
      } else {
        // Add default endpoints based on module type
        moduleConfig.endpoints = this.getDefaultEndpoints(moduleName);
      }

      this.config.modules.push(moduleConfig);
    }
  }

  async collectEndpoints(moduleConfig) {
    console.log('Enter endpoints (format: GET:/path, POST:/path, etc. Empty line to finish):');
    
    while (true) {
      const endpoint = await this.askQuestion('Endpoint: ');
      if (!endpoint.trim()) break;
      
      const [method, path] = endpoint.split(':');
      if (method && path) {
        moduleConfig.endpoints.push({
          method: method.toUpperCase(),
          path: path.trim(),
          description: await this.askQuestion(`Description for ${method}:${path}: `) || ''
        });
      }
    }
  }

  getDefaultEndpoints(moduleName) {
    const defaults = {
      'item': [
        { method: 'GET', path: '/', description: 'Get user items' },
        { method: 'POST', path: '/upload', description: 'Upload item to storage' },
        { method: 'POST', path: '/request-download', description: 'Request item download' },
        { method: 'POST', path: '/confirm-download', description: 'Confirm item download' },
        { method: 'POST', path: '/update', description: 'Update items database' }
      ],
      'player-stats': [
        { method: 'GET', path: '/', description: 'Get player statistics' },
        { method: 'POST', path: '/update', description: 'Update player statistics' },
        { method: 'GET', path: '/leaderboard/:stat', description: 'Get leaderboard for specific stat' },
        { method: 'GET', path: '/achievements', description: 'Get player achievements' }
      ],
      'server-info': [
        { method: 'GET', path: '/', description: 'Get server information' },
        { method: 'POST', path: '/update', description: 'Update server status' },
        { method: 'GET', path: '/players', description: 'Get online players' },
        { method: 'GET', path: '/status', description: 'Get server status' }
      ]
    };
    
    return defaults[moduleName] || [];
  }

  async collectDatabaseInfo() {
    console.log('\n🗄️ Database Configuration:');
    
    this.config.database = {
      createSchema: await this.askQuestion('Create new database schema? (y/n): ').then(a => a.toLowerCase() === 'y'),
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
            { name: 'player_id', type: 'TEXT UNIQUE' },
            { name: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' }
          ]
        },
        {
          name: 'online_storage_items',
          description: 'Player inventory items',
          fields: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'storage_id', type: 'INTEGER NOT NULL' },
            { name: 'item_id', type: 'INTEGER NOT NULL' },
            { name: 'quantity', type: 'INTEGER NOT NULL DEFAULT 0' },
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
            { name: 'player_id', type: 'TEXT NOT NULL' },
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

  async customizeTable(table) {
    console.log(`\nCustomizing ${table.name} table:`);
    console.log('Enter additional fields (format: name:type, empty line to finish):');
    
    while (true) {
      const field = await this.askQuestion('Field: ');
      if (!field.trim()) break;
      
      const [name, type] = field.split(':');
      if (name && type) {
        table.fields.push({
          name: name.trim(),
          type: type.trim()
        });
      }
    }
  }

  async generateModule() {
    const basePath = path.join(__dirname, '..', 'src', this.config.game.moduleName);
    
    // Create base directory
    this.ensureDir(basePath);
    
    // Generate main module file
    await this.generateMainModule(basePath);
    
    // Generate sub-modules
    for (const module of this.config.modules) {
      await this.generateSubModule(basePath, module);
    }
    
    // Generate database schema
    if (this.config.database.createSchema) {
      await this.generateDatabaseSchema();
    }
    
    // Update app.module.ts
    await this.updateAppModule();
    
    console.log(`\n📁 Generated module at: ${basePath}`);
  }

  async generateMainModule(basePath) {
    const imports = this.config.modules.map(m => 
      `import { ${this.toPascalCase(m.name)}Module } from './${m.name}/${m.name}.module';`
    ).join('\n');
    
    const moduleImports = this.config.modules.map(m => `${this.toPascalCase(m.name)}Module`).join(',\n    ');
    
    const content = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
${imports}

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ${moduleImports},
  ],
  exports: [${moduleImports}],
})
export class ${this.config.game.moduleName}Module {}`;

    fs.writeFileSync(path.join(basePath, `${this.config.game.moduleName.toLowerCase()}.module.ts`), content);
  }

  async generateSubModule(basePath, moduleConfig) {
    const modulePath = path.join(basePath, moduleConfig.name);
    this.ensureDir(modulePath);
    
    // Generate module file
    const moduleContent = this.generateModuleFile(moduleConfig);
    fs.writeFileSync(path.join(modulePath, `${moduleConfig.name}.module.ts`), moduleContent);
    
    // Generate controller file
    const controllerContent = this.generateControllerFile(moduleConfig);
    fs.writeFileSync(path.join(modulePath, `${moduleConfig.name}.controller.ts`), controllerContent);
    
    // Generate service file
    const serviceContent = this.generateServiceFile(moduleConfig);
    fs.writeFileSync(path.join(modulePath, `${moduleConfig.name}.service.ts`), serviceContent);
  }

  generateModuleFile(moduleConfig) {
    const className = this.toPascalCase(moduleConfig.name);
    
    return `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ${className}Controller } from './${moduleConfig.name}.controller';
import { ${className}Service } from './${moduleConfig.name}.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}`;
  }

  generateControllerFile(moduleConfig) {
    const className = this.toPascalCase(moduleConfig.name);
    const serviceName = className.toLowerCase() + 'Service';
    
    const endpoints = moduleConfig.endpoints.map(endpoint => {
      const methodDecorator = endpoint.method === 'GET' ? 'Get' : 'Post';
      const pathParam = endpoint.path === '/' ? '' : `('${endpoint.path}')`;
      
      return `  @${methodDecorator}${pathParam}
  async ${this.toCamelCase(endpoint.method + endpoint.path.replace(/[^a-zA-Z0-9]/g, ''))}(@Request() req${endpoint.method === 'POST' ? ', @Body() body: any' : ''}) {
    // ${endpoint.description}
    const userId = req.user.id;
    // Implement your logic here
    return { message: 'Not implemented yet' };
  }`;
    }).join('\n\n');

    return `import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ${className}Service } from './${moduleConfig.name}.service';

@Controller('api/${this.config.game.schemaName}/${moduleConfig.name}')
@UseGuards(JwtAuthGuard)
export class ${className}Controller {
  private readonly logger = new Logger(${className}Controller.name);

  constructor(private readonly ${serviceName}: ${className}Service) {}

${endpoints}
}`;
  }

  generateServiceFile(moduleConfig) {
    const className = this.toPascalCase(moduleConfig.name);
    
    return `import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class ${className}Service {
  private readonly logger = new Logger(${className}Service.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Implement your service methods here
  async getInfo(): Promise<any> {
    this.logger.log('Getting ${moduleConfig.displayName} information');
    return { message: 'Service method not implemented yet' };
  }
}`;
  }

  async generateDatabaseSchema() {
    const schemaName = this.config.game.schemaName;
    const tables = this.config.database.tables;
    
    let sql = `-- ${this.config.game.displayName} Database Schema\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;
    sql += `-- Create schema\n`;
    sql += `CREATE SCHEMA IF NOT EXISTS ${schemaName};\n\n`;
    
    for (const table of tables) {
      sql += `-- Create ${table.description}\n`;
      sql += `CREATE TABLE IF NOT EXISTS ${schemaName}.${table.name} (\n`;
      sql += table.fields.map(field => `  ${field.name} ${field.type}`).join(',\n');
      sql += `\n);\n\n`;
    }
    
    // Generate indexes
    sql += `-- Create indexes for better performance\n`;
    for (const table of tables) {
      const primaryKeys = table.fields.filter(f => f.type.includes('PRIMARY KEY'));
      if (primaryKeys.length === 0) {
        sql += `CREATE INDEX IF NOT EXISTS idx_${schemaName}_${table.name}_id ON ${schemaName}.${table.name}(id);\n`;
      }
    }
    
    const schemaPath = path.join(__dirname, '..', 'database-schemas', `${schemaName}-schema.sql`);
    this.ensureDir(path.dirname(schemaPath));
    fs.writeFileSync(schemaPath, sql);
    
    console.log(`\n📊 Database schema generated at: ${schemaPath}`);
  }

  async updateAppModule() {
    const appModulePath = path.join(__dirname, '..', 'src', 'app.module.ts');
    let content = fs.readFileSync(appModulePath, 'utf8');
    
    const importLine = `import { ${this.config.game.moduleName}Module } from './${this.config.game.moduleName}/${this.config.game.moduleName.toLowerCase()}.module';`;
    
    // Add import
    if (!content.includes(importLine)) {
      const lastImportIndex = content.lastIndexOf('import');
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextLineIndex) + '\n' + importLine + content.slice(nextLineIndex);
    }
    
    // Add to imports array
    const moduleName = `${this.config.game.moduleName}Module`;
    if (!content.includes(moduleName)) {
      content = content.replace(
        /(imports:\s*\[[\s\S]*?)(,\s*\])/,
        `$1,\n    ${moduleName}$2`
      );
    }
    
    fs.writeFileSync(appModulePath, content);
    console.log(`\n📝 Updated app.module.ts`);
  }

  // Utility functions
  toPascalCase(str) {
    return str.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
              .replace(/[-_\s]/g, '');
  }

  toCamelCase(str) {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the generator
if (require.main === module) {
  const generator = new GameModuleGenerator();
  generator.start();
}

module.exports = GameModuleGenerator;
