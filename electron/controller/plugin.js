const { Controller } = require('ee-core');
const Services = require('ee-core/services');
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');

class PluginController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.pluginDir = path.join(app.getPath('userData'), 'plugins');
    this.mcpProcesses = new Map();

    if (!fs.existsSync(this.pluginDir)) {
      fs.mkdirSync(this.pluginDir, { recursive: true });
    }
  }

  async installPlugin(args) {
    const { pluginData, files } = args;

    try {
      const pluginPath = path.join(this.pluginDir, pluginData.name);

      if (!fs.existsSync(pluginPath)) {
        fs.mkdirSync(pluginPath, { recursive: true });
      }

      if (files && files.length > 0) {
        for (const file of files) {
          const filePath = path.join(pluginPath, file.name);
          const fileDir = path.dirname(filePath);

          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }

          fs.writeFileSync(filePath, file.content);
        }
      }

      const pluginService = Services.get('plugin');
      const plugin = await pluginService.createPlugin(pluginData);

      return {
        success: true,
        plugin
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async uninstallPlugin(args) {
    const { pluginId } = args;

    try {
      const pluginService = Services.get('plugin');
      const plugin = await pluginService.getPlugin(pluginId);

      if (!plugin) {
        throw new Error('Plugin not found');
      }

      if (plugin.type === 'mcp') {
        await this.stopMcpServer({ pluginId });
      }

      const pluginPath = path.join(this.pluginDir, plugin.name);
      if (fs.existsSync(pluginPath)) {
        fs.rmSync(pluginPath, { recursive: true, force: true });
      }

      await pluginService.deletePlugin(pluginId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async togglePlugin(args) {
    const { pluginId, enabled } = args;

    try {
      const pluginService = Services.get('plugin');
      const plugin = await pluginService.updatePlugin(pluginId, { enabled });

      if (plugin.type === 'mcp') {
        if (enabled) {
          await this.startMcpServer({ pluginId });
        } else {
          await this.stopMcpServer({ pluginId });
        }
      }

      return {
        success: true,
        plugin
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async startMcpServer(args) {
    const { pluginId } = args;

    try {
      const pluginService = Services.get('plugin');
      const plugin = await pluginService.getPlugin(pluginId);

      if (!plugin || plugin.type !== 'mcp') {
        throw new Error('Invalid MCP plugin');
      }

      const mcpServers = await pluginService.getMcpServers(pluginId);

      for (const server of mcpServers) {
        if (this.mcpProcesses.has(server.id)) {
          continue;
        }

        const args = Array.isArray(server.args) ? server.args : [];
        const env = { ...process.env, ...(server.env || {}) };

        const mcpProcess = spawn(server.command, args, { env });

        mcpProcess.on('error', (error) => {
          console.error(`MCP Server ${server.name} error:`, error);
          pluginService.updateMcpServerStatus(server.id, 'error');
        });

        mcpProcess.on('exit', (code) => {
          console.log(`MCP Server ${server.name} exited with code ${code}`);
          this.mcpProcesses.delete(server.id);
          pluginService.updateMcpServerStatus(server.id, 'stopped');
        });

        this.mcpProcesses.set(server.id, mcpProcess);
        await pluginService.updateMcpServerStatus(server.id, 'running');
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async stopMcpServer(args) {
    const { pluginId } = args;

    try {
      const pluginService = Services.get('plugin');
      const mcpServers = await pluginService.getMcpServers(pluginId);

      for (const server of mcpServers) {
        const mcpProcess = this.mcpProcesses.get(server.id);
        if (mcpProcess) {
          mcpProcess.kill();
          this.mcpProcesses.delete(server.id);
        }
        await pluginService.updateMcpServerStatus(server.id, 'stopped');
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async openPluginWindow(args) {
    const { pluginId } = args;

    try {
      const pluginService = Services.get('plugin');
      const plugin = await pluginService.getPlugin(pluginId);

      if (!plugin || plugin.type !== 'html') {
        throw new Error('Invalid HTML plugin');
      }

      const pluginPath = path.join(this.pluginDir, plugin.name, plugin.entry_point);

      if (!fs.existsSync(pluginPath)) {
        throw new Error('Plugin entry point not found');
      }

      const pluginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      pluginWindow.loadFile(pluginPath);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async importPlugin(args) {
    const { filePath } = args;

    try {
      const pluginData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const pluginDir = path.dirname(filePath);
      const files = [];

      function readDir(dir, basePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);

          if (entry.isDirectory()) {
            readDir(fullPath, relativePath);
          } else if (entry.name !== 'plugin.json') {
            files.push({
              name: relativePath,
              content: fs.readFileSync(fullPath, 'utf-8')
            });
          }
        }
      }

      readDir(pluginDir);

      return await this.installPlugin({ pluginData, files });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

PluginController.toString = () => '[class PluginController]';
module.exports = PluginController;
