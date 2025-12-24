# AI Chat + Plugin System - 项目概述

## 项目简介

基于 electron-egg 框架开发的桌面应用，集成了 AI 对话功能和灵活的插件系统。该应用提供了现代化的用户界面，支持多种 AI 模型和两种类型的插件系统。

## 核心功能

### 1. AI 对话系统
- **多模型支持**：OpenAI、Anthropic、DeepSeek 等主流在线 AI 服务
- **本地模型**：完整支持 Ollama 本地模型
- **会话管理**：创建、切换、删除多个对话
- **持久化存储**：所有对话历史保存在 Supabase 数据库
- **灵活配置**：自定义温度、token 限制等参数

### 2. 插件系统

#### HTML 插件
- 加载和运行独立的 HTML 应用
- 独立窗口运行
- 完整的 JavaScript 和 CSS 支持
- 示例：计算器、天气查询等工具

#### MCP Server 插件
- 支持 Model Context Protocol 服务器
- 可与 AI 对话系统集成
- 后台进程管理
- 环境变量配置

### 3. 插件管理
- **安装**：手动创建或导入插件包
- **卸载**：完整清理插件文件和数据库记录
- **启用/禁用**：动态控制插件状态
- **本地导入**：从本地文件系统导入插件

## 技术架构

### 前端技术栈
```
React 18.2           - UI 框架
Vite 5.4            - 构建工具
Tailwind CSS 3.3    - 样式框架
shadcn/ui           - UI 组件库
Zustand 4.4         - 状态管理
React Router 6.20   - 路由管理
Lucide React        - 图标库
```

### 后端技术栈
```
Electron 39.2       - 桌面应用框架
electron-egg 4.2    - Electron 开发框架
Supabase            - 数据库服务
Node.js             - 运行时环境
```

### 数据库设计

**表结构：**
1. `plugins` - 插件信息
2. `mcp_servers` - MCP 服务器配置
3. `ai_configs` - AI 模型配置
4. `conversations` - 对话记录
5. `messages` - 消息内容

所有表启用 RLS (Row Level Security)，支持公开访问（桌面应用场景）。

## 项目结构

```
project/
├── electron/                    # Electron 主进程
│   ├── controller/
│   │   ├── plugin.js           # 插件控制器
│   │   ├── ai.js               # AI 控制器
│   │   └── example.js          # 示例控制器
│   ├── service/
│   │   ├── plugin.js           # 插件服务
│   │   ├── ai.js               # AI 服务
│   │   └── example.js          # 示例服务
│   ├── preload/
│   │   └── bridge.js           # IPC 通信桥接
│   └── main.js                 # 主进程入口
│
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui 组件
│   │   │   └── Layout.jsx      # 主布局
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx    # 聊天页面
│   │   │   ├── PluginsPage.jsx # 插件页面
│   │   │   └── SettingsPage.jsx # 设置页面
│   │   ├── stores/
│   │   │   ├── chatStore.js    # 聊天状态
│   │   │   └── pluginStore.js  # 插件状态
│   │   ├── lib/
│   │   │   ├── utils.js        # 工具函数
│   │   │   └── supabase.js     # Supabase 客户端
│   │   ├── App.jsx             # 应用根组件
│   │   ├── main.jsx            # 前端入口
│   │   └── index.css           # 全局样式
│   ├── tailwind.config.js      # Tailwind 配置
│   ├── vite.config.js          # Vite 配置
│   └── package.json
│
├── example-plugins/             # 示例插件
│   └── calculator/             # 计算器插件
│
├── build/                       # 构建资源
├── public/                      # 静态资源
├── USAGE_GUIDE.md              # 使用指南
├── PLUGIN_EXAMPLE.md           # 插件开发指南
└── package.json
```

## 核心功能实现

### 插件加载机制

1. **HTML 插件**
   ```javascript
   // 创建独立窗口
   const pluginWindow = new BrowserWindow({
     width: 800,
     height: 600,
     webPreferences: {
       nodeIntegration: false,
       contextIsolation: true,
     }
   });
   pluginWindow.loadFile(pluginPath);
   ```

2. **MCP Server 插件**
   ```javascript
   // 启动 MCP 进程
   const mcpProcess = spawn(command, args, { env });
   // 管理进程生命周期
   mcpProcess.on('exit', handleExit);
   ```

### AI 对话流程

1. 用户输入消息
2. 保存用户消息到数据库
3. 根据配置调用对应的 AI API
4. 接收 AI 响应
5. 保存 AI 响应到数据库
6. 更新 UI 显示

### 数据持久化

使用 Supabase 作为数据库：
- 实时数据同步
- RESTful API 接口
- 行级安全策略
- 自动处理连接池

## 开发命令

```bash
npm install              # 安装根依赖
cd frontend && npm install  # 安装前端依赖

npm run dev              # 开发模式（前端+后端）
npm run dev-frontend     # 仅前端开发
npm run dev-electron     # 仅 Electron 开发

npm run build            # 完整构建
npm run build-frontend   # 构建前端
npm run build-electron   # 构建 Electron

npm run build-w          # 构建 Windows 版本
npm run build-m          # 构建 macOS 版本
npm run build-l          # 构建 Linux 版本
```

## 环境配置

需要在 `.env` 文件中配置以下变量：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 特性亮点

### 1. 现代化 UI/UX
- 基于 shadcn/ui 的精美组件
- Tailwind CSS 响应式设计
- 流畅的动画和过渡效果
- 深色/浅色主题支持

### 2. 灵活的插件系统
- 类似 rubick 的插件架构
- 支持两种插件类型
- 完整的生命周期管理
- 沙箱隔离保证安全

### 3. 强大的 AI 集成
- 支持多种 AI 提供商
- 本地模型支持（Ollama）
- 流式响应（可扩展）
- 自定义参数配置

### 4. 数据安全
- Supabase 企业级数据库
- 行级安全策略
- API Key 安全存储
- 数据备份和恢复

## 扩展性

### 添加新的 AI 提供商
在 `electron/service/ai.js` 中添加新的 provider 逻辑：
```javascript
getDefaultBaseUrl(provider) {
  const urls = {
    'new-provider': 'https://api.newprovider.com'
  };
  return urls[provider];
}
```

### 添加新的插件类型
1. 在数据库 schema 中定义新类型
2. 在 `electron/controller/plugin.js` 中添加处理逻辑
3. 在前端添加对应的 UI 组件

### 自定义 UI 组件
所有 UI 组件都在 `frontend/src/components/ui/` 目录下，基于 Radix UI 和 Tailwind CSS，可以轻松自定义。

## 已知限制

1. **性能**：大量消息时可能需要分页加载
2. **插件安全**：HTML 插件运行在独立窗口，但仍需注意恶意代码
3. **流式响应**：当前实现不支持流式输出（可扩展）
4. **多用户**：当前设计为单用户桌面应用

## 未来计划

- [ ] 支持流式 AI 响应
- [ ] 插件市场功能
- [ ] 更多内置插件
- [ ] 插件权限管理
- [ ] 多语言支持
- [ ] 主题自定义
- [ ] 导出对话记录
- [ ] 语音输入支持

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

Apache License 2.0

## 致谢

- electron-egg 框架
- shadcn/ui 组件库
- Supabase 数据库服务
- React 生态系统
