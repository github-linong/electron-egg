const { Service } = require('ee-core');
const { createClient } = require('@supabase/supabase-js');

class PluginService extends Service {
  constructor(ctx) {
    super(ctx);

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createPlugin(pluginData) {
    const { data, error } = await this.supabase
      .from('plugins')
      .insert([pluginData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getPlugin(pluginId) {
    const { data, error } = await this.supabase
      .from('plugins')
      .select('*')
      .eq('id', pluginId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllPlugins() {
    const { data, error } = await this.supabase
      .from('plugins')
      .select('*')
      .order('installed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updatePlugin(pluginId, updates) {
    const { data, error } = await this.supabase
      .from('plugins')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', pluginId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async deletePlugin(pluginId) {
    const { error } = await this.supabase
      .from('plugins')
      .delete()
      .eq('id', pluginId);

    if (error) throw error;
    return true;
  }

  async createMcpServer(serverData) {
    const { data, error } = await this.supabase
      .from('mcp_servers')
      .insert([serverData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getMcpServers(pluginId) {
    const { data, error } = await this.supabase
      .from('mcp_servers')
      .select('*')
      .eq('plugin_id', pluginId);

    if (error) throw error;
    return data || [];
  }

  async updateMcpServerStatus(serverId, status) {
    const { data, error } = await this.supabase
      .from('mcp_servers')
      .update({ status })
      .eq('id', serverId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

PluginService.toString = () => '[class PluginService]';
module.exports = PluginService;
