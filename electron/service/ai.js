const { Service } = require('ee-core');
const { createClient } = require('@supabase/supabase-js');

class AiService extends Service {
  constructor(ctx) {
    super(ctx);

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createAiConfig(configData) {
    const { data, error } = await this.supabase
      .from('ai_configs')
      .insert([configData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAiConfig(configId) {
    const { data, error } = await this.supabase
      .from('ai_configs')
      .select('*')
      .eq('id', configId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getActiveAiConfig() {
    const { data, error } = await this.supabase
      .from('ai_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllAiConfigs() {
    const { data, error } = await this.supabase
      .from('ai_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateAiConfig(configId, updates) {
    const { data, error } = await this.supabase
      .from('ai_configs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', configId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async setActiveConfig(configId) {
    await this.supabase
      .from('ai_configs')
      .update({ is_active: false })
      .neq('id', configId);

    return await this.updateAiConfig(configId, { is_active: true });
  }

  async deleteAiConfig(configId) {
    const { error } = await this.supabase
      .from('ai_configs')
      .delete()
      .eq('id', configId);

    if (error) throw error;
    return true;
  }

  async createConversation(conversationData) {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getConversation(conversationId) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllConversations() {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateConversation(conversationId, updates = {}) {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async deleteConversation(conversationId) {
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  }

  async createMessage(messageData) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([messageData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getMessages(conversationId) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async generateResponse(message, config) {
    try {
      if (config.is_local) {
        return await this.generateOllamaResponse(message, config);
      } else {
        return await this.generateOnlineResponse(message, config);
      }
    } catch (error) {
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async generateOllamaResponse(message, config) {
    const baseUrl = config.api_base_url || 'http://localhost:11434';
    const url = `${baseUrl}/api/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt: message,
        stream: false,
        options: config.parameters || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  async generateOnlineResponse(message, config) {
    const baseUrl = config.api_base_url || this.getDefaultBaseUrl(config.provider);
    const url = `${baseUrl}/v1/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: message }],
        ...config.parameters
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  getDefaultBaseUrl(provider) {
    const urls = {
      'openai': 'https://api.openai.com',
      'anthropic': 'https://api.anthropic.com',
      'deepseek': 'https://api.deepseek.com'
    };

    return urls[provider] || 'https://api.openai.com';
  }
}

AiService.toString = () => '[class AiService]';
module.exports = AiService;
