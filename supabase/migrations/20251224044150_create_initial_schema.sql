/*
  # Initial Schema for AI Chat + Plugin System

  1. New Tables
    - `plugins`
      - `id` (uuid, primary key)
      - `name` (text) - Plugin name
      - `version` (text) - Plugin version
      - `type` (text) - 'html' or 'mcp'
      - `description` (text) - Plugin description
      - `author` (text) - Plugin author
      - `entry_point` (text) - Entry file path for HTML plugins
      - `config` (jsonb) - Plugin configuration
      - `enabled` (boolean) - Whether plugin is enabled
      - `installed_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `mcp_servers`
      - `id` (uuid, primary key)
      - `plugin_id` (uuid, foreign key to plugins)
      - `name` (text) - Server name
      - `command` (text) - Command to start server
      - `args` (jsonb) - Command arguments
      - `env` (jsonb) - Environment variables
      - `status` (text) - 'running', 'stopped', 'error'
      - `created_at` (timestamptz)
    
    - `ai_configs`
      - `id` (uuid, primary key)
      - `name` (text) - Config name
      - `provider` (text) - 'openai', 'anthropic', 'ollama', etc.
      - `model` (text) - Model name
      - `api_key` (text) - API key (encrypted)
      - `api_base_url` (text) - Custom API base URL
      - `parameters` (jsonb) - Temperature, max_tokens, etc.
      - `is_active` (boolean) - Currently active config
      - `is_local` (boolean) - Is local model (Ollama)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `conversations`
      - `id` (uuid, primary key)
      - `title` (text) - Conversation title
      - `ai_config_id` (uuid, foreign key to ai_configs)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `role` (text) - 'user', 'assistant', 'system'
      - `content` (text) - Message content
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for local access (desktop app)
*/

-- Plugins table
CREATE TABLE IF NOT EXISTS plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  type text NOT NULL CHECK (type IN ('html', 'mcp')),
  description text DEFAULT '',
  author text DEFAULT '',
  entry_point text,
  config jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  installed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to plugins"
  ON plugins
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- MCP Servers table
CREATE TABLE IF NOT EXISTS mcp_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id uuid REFERENCES plugins(id) ON DELETE CASCADE,
  name text NOT NULL,
  command text NOT NULL,
  args jsonb DEFAULT '[]',
  env jsonb DEFAULT '{}',
  status text DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to mcp_servers"
  ON mcp_servers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- AI Configs table
CREATE TABLE IF NOT EXISTS ai_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  api_key text DEFAULT '',
  api_base_url text DEFAULT '',
  parameters jsonb DEFAULT '{"temperature": 0.7, "max_tokens": 2000}',
  is_active boolean DEFAULT false,
  is_local boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to ai_configs"
  ON ai_configs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Conversation',
  ai_config_id uuid REFERENCES ai_configs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to conversations"
  ON conversations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to messages"
  ON messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plugins_type ON plugins(type);
CREATE INDEX IF NOT EXISTS idx_plugins_enabled ON plugins(enabled);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_plugin_id ON mcp_servers(plugin_id);
CREATE INDEX IF NOT EXISTS idx_ai_configs_is_active ON ai_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_ai_config_id ON conversations(ai_config_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
