# 插件开发指南

## HTML 插件示例

### 1. 简单的计算器插件

创建一个名为 `calculator` 的文件夹，包含以下文件：

**plugin.json**
```json
{
  "name": "Calculator",
  "version": "1.0.0",
  "type": "html",
  "description": "A simple calculator plugin",
  "author": "Your Name",
  "entry_point": "index.html"
}
```

**index.html**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculator</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="calculator">
    <input type="text" id="display" disabled>
    <div class="buttons">
      <button onclick="appendNumber('7')">7</button>
      <button onclick="appendNumber('8')">8</button>
      <button onclick="appendNumber('9')">9</button>
      <button onclick="setOperation('/')">/</button>
      <button onclick="appendNumber('4')">4</button>
      <button onclick="appendNumber('5')">5</button>
      <button onclick="appendNumber('6')">6</button>
      <button onclick="setOperation('*')">*</button>
      <button onclick="appendNumber('1')">1</button>
      <button onclick="appendNumber('2')">2</button>
      <button onclick="appendNumber('3')">3</button>
      <button onclick="setOperation('-')">-</button>
      <button onclick="appendNumber('0')">0</button>
      <button onclick="clearDisplay()">C</button>
      <button onclick="calculate()">=</button>
      <button onclick="setOperation('+')">+</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

**style.css**
```css
body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.calculator {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

#display {
  width: 100%;
  height: 60px;
  font-size: 24px;
  text-align: right;
  border: 2px solid #667eea;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

button {
  height: 60px;
  font-size: 20px;
  border: none;
  border-radius: 5px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background: #764ba2;
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}
```

**script.js**
```javascript
let currentValue = '0';
let previousValue = null;
let operation = null;

function updateDisplay() {
  document.getElementById('display').value = currentValue;
}

function appendNumber(number) {
  if (currentValue === '0') {
    currentValue = number;
  } else {
    currentValue += number;
  }
  updateDisplay();
}

function setOperation(op) {
  if (previousValue === null) {
    previousValue = currentValue;
  } else if (operation) {
    calculate();
    previousValue = currentValue;
  }
  operation = op;
  currentValue = '0';
}

function calculate() {
  if (previousValue === null || operation === null) return;

  const prev = parseFloat(previousValue);
  const current = parseFloat(currentValue);
  let result;

  switch (operation) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '*':
      result = prev * current;
      break;
    case '/':
      result = prev / current;
      break;
    default:
      return;
  }

  currentValue = result.toString();
  previousValue = null;
  operation = null;
  updateDisplay();
}

function clearDisplay() {
  currentValue = '0';
  previousValue = null;
  operation = null;
  updateDisplay();
}

updateDisplay();
```

### 2. 天气查询插件

**plugin.json**
```json
{
  "name": "Weather",
  "version": "1.0.0",
  "type": "html",
  "description": "Check weather information",
  "author": "Your Name",
  "entry_point": "index.html"
}
```

**index.html**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .weather-card {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    h1 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .search-box {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    input {
      flex: 1;
      padding: 10px;
      border: 2px solid #667eea;
      border-radius: 5px;
      font-size: 16px;
    }

    button {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }

    button:hover {
      background: #764ba2;
    }

    .weather-info {
      margin-top: 20px;
    }

    .temperature {
      font-size: 48px;
      font-weight: bold;
      color: #667eea;
    }

    .description {
      font-size: 20px;
      color: #666;
      margin: 10px 0;
    }

    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }

    .detail-item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 5px;
    }

    .detail-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 5px;
    }

    .detail-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .loading, .error {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .error {
      color: #e74c3c;
    }
  </style>
</head>
<body>
  <div class="weather-card">
    <h1>天气查询</h1>
    <div class="search-box">
      <input type="text" id="cityInput" placeholder="输入城市名（如：Beijing）">
      <button onclick="searchWeather()">查询</button>
    </div>
    <div id="weatherResult"></div>
  </div>

  <script>
    async function searchWeather() {
      const city = document.getElementById('cityInput').value;
      const resultDiv = document.getElementById('weatherResult');

      if (!city) {
        resultDiv.innerHTML = '<div class="error">请输入城市名</div>';
        return;
      }

      resultDiv.innerHTML = '<div class="loading">加载中...</div>';

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric&lang=zh_cn`
        );

        if (!response.ok) {
          throw new Error('城市未找到');
        }

        const data = await response.json();

        resultDiv.innerHTML = `
          <div class="weather-info">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <div class="description">${data.weather[0].description}</div>
            <div class="details">
              <div class="detail-item">
                <div class="detail-label">体感温度</div>
                <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">湿度</div>
                <div class="detail-value">${data.main.humidity}%</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">风速</div>
                <div class="detail-value">${data.wind.speed} m/s</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">气压</div>
                <div class="detail-value">${data.main.pressure} hPa</div>
              </div>
            </div>
          </div>
        `;
      } catch (error) {
        resultDiv.innerHTML = `<div class="error">${error.message}</div>`;
      }
    }
  </script>
</body>
</html>
```

## MCP Server 插件示例

### 文件系统 MCP Server

**plugin.json**
```json
{
  "name": "File System MCP",
  "version": "1.0.0",
  "type": "mcp",
  "description": "MCP server for file system operations",
  "author": "Your Name",
  "config": {
    "servers": [
      {
        "name": "filesystem",
        "command": "node",
        "args": ["server.js"],
        "env": {
          "ALLOWED_PATHS": "/home/user/documents"
        }
      }
    ]
  }
}
```

**server.js**
```javascript
const { MCPServer } = require('@modelcontextprotocol/sdk');
const fs = require('fs').promises;
const path = require('path');

const server = new MCPServer({
  name: 'filesystem',
  version: '1.0.0'
});

server.tool('read_file', {
  description: 'Read contents of a file',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file'
      }
    },
    required: ['path']
  }
}, async ({ path: filePath }) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { content };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

server.tool('write_file', {
  description: 'Write content to a file',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file'
      },
      content: {
        type: 'string',
        description: 'Content to write'
      }
    },
    required: ['path', 'content']
  }
}, async ({ path: filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
});

server.tool('list_directory', {
  description: 'List files in a directory',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the directory'
      }
    },
    required: ['path']
  }
}, async ({ path: dirPath }) => {
  try {
    const files = await fs.readdir(dirPath);
    return { files };
  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
});

server.start();
```

## 插件导入方法

1. 准备插件文件夹，确保包含 `plugin.json`
2. 在应用的 Plugins 页面点击 "Import"
3. 选择 `plugin.json` 文件
4. 系统会自动导入所有相关文件
5. 启用插件即可使用

## 插件开发注意事项

1. HTML 插件：
   - 所有资源文件必须使用相对路径
   - 可以使用现代 JavaScript 特性
   - 建议使用 CSS 框架美化界面
   - 注意跨域问题（CORS）

2. MCP Server 插件：
   - 需要 Node.js 环境
   - 遵循 MCP 协议规范
   - 合理处理错误情况
   - 考虑权限和安全性

3. 性能优化：
   - 避免阻塞主线程
   - 合理使用缓存
   - 优化资源加载

4. 用户体验：
   - 提供清晰的加载状态
   - 友好的错误提示
   - 响应式设计
