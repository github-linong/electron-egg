# AI Chat + Plugin System Desktop App

基于 electron-egg 构建的桌面应用，支持 AI 对话和插件系统。

## 功能特性

### 1. AI 对话系统
- 支持多种在线 AI 模型（OpenAI、Anthropic、DeepSeek 等）
- 支持本地模型（Ollama）
- 多会话管理
- 完整的对话历史记录

### 2. 插件系统
- **HTML 插件**：支持加载和运行 HTML 应用插件
- **MCP Server 插件**：支持 MCP（Model Context Protocol）服务器插件
- 插件生命周期管理：安装、卸载、启用/禁用
- 本地导入插件功能

### 3. 数据持久化
- 使用 Supabase 作为数据库
- 自动保存对话历史
- 插件配置持久化

## 使用说明

### 初次设置

1. **配置 AI 模型**
   - 进入 Settings 页面
   - 点击 "Add Configuration"
   - 填写配置信息：
     - 在线模型：需要提供 API Key
     - 本地模型（Ollama）：开启"Local Model"开关，配置 Ollama 地址
   - 点击 "Set Active" 激活配置

2. **开始对话**
   - 返回 Chat 页面
   - 点击 "New Chat" 创建新对话
   - 输入消息开始聊天

### 插件管理

#### 安装插件

**方式一：手动添加**
1. 进入 Plugins 页面
2. 点击 "Add Plugin"
3. 填写插件信息
4. 选择插件类型（HTML 或 MCP）

**方式二：导入插件包**
1. 点击 "Import" 按钮
2. 选择 plugin.json 文件
3. 系统自动导入插件及其资源文件

#### HTML 插件结构示例

```
my-plugin/
├── plugin.json
├── index.html
├── style.css
└── script.js
```

plugin.json 示例：
```json
{
  "name": "My Plugin",
  "version": "1.0.0",
  "type": "html",
  "description": "插件描述",
  "author": "作者名",
  "entry_point": "index.html"
}
```

#### MCP Server 插件

MCP 插件配置示例：
```json
{
  "name": "MCP Server Plugin",
  "version": "1.0.0",
  "type": "mcp",
  "description": "MCP 服务器插件",
  "author": "作者名",
  "config": {
    "servers": [
      {
        "name": "my-mcp-server",
        "command": "node",
        "args": ["server.js"],
        "env": {
          "API_KEY": "your-key"
        }
      }
    ]
  }
}
```

### AI 配置说明

#### 在线模型配置

**OpenAI**
- Provider: `openai`
- Model: `gpt-4`, `gpt-3.5-turbo` 等
- API Key: 从 OpenAI 获取
- API Base URL: 默认为 `https://api.openai.com`

**Anthropic Claude**
- Provider: `anthropic`
- Model: `claude-3-opus`, `claude-3-sonnet` 等
- API Key: 从 Anthropic 获取

**DeepSeek**
- Provider: `deepseek`
- Model: `deepseek-chat`, `deepseek-coder` 等
- API Key: 从 DeepSeek 获取

#### 本地模型配置（Ollama）

1. 安装 Ollama：https://ollama.ai
2. 下载模型：`ollama pull llama2`
3. 在应用中配置：
   - 开启 "Local Model"
   - Model: `llama2` 或其他已安装的模型
   - API Base URL: `http://localhost:11434`

## 开发

### 项目结构

```
project/
├── electron/              # Electron 主进程
│   ├── controller/       # 控制器（插件、AI）
│   └── service/          # 服务层（数据库操作）
├── frontend/             # React 前端
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── pages/       # 页面
│   │   ├── stores/      # 状态管理（Zustand）
│   │   └── lib/         # 工具库
│   └── package.json
└── package.json
```

### 本地开发

```bash
npm install
cd frontend && npm install
cd ..
npm run dev
```

### 构建应用

```bash
npm run build
```

构建完成后的文件在 `dist` 目录。

## 技术栈

- **框架**：Electron + electron-egg
- **前端**：React + Vite
- **UI 组件**：shadcn/ui + Radix UI
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **数据库**：Supabase
- **AI 集成**：支持多种 AI 提供商

## 注意事项

1. 使用前请确保已配置 Supabase 环境变量（在 `.env` 文件中）
2. API Key 会存储在 Supabase 数据库中，请妥善保管数据库访问权限
3. 本地模型需要先安装 Ollama 并下载对应模型
4. MCP 插件需要 Node.js 环境支持

## 许可证

Apache License 2.0
