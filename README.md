# ♟️ 五子棋 Mono Repo 项目

一个基于 **Mono Repository** 架构的跨框架五子棋游戏，展示如何将核心业务逻辑与前端框架解耦。

## 🎯 项目特点

- ✅ **Mono Repo 架构**: 使用 pnpm workspace 管理多包项目
- ✅ **框架无关的核心逻辑**: 纯 TypeScript 实现的五子棋引擎
- ✅ **三大主流框架**: Vue 3、React 18、Angular 19
- ✅ **完整的游戏逻辑**: 15×15 棋盘、五子连珠判定、回合管理
- ✅ **现代化 UI**: 渐变背景、动画效果、响应式设计
- ✅ **TypeScript 全栈**: 类型安全的开发体验

## 📦 项目结构

```
volatile-aphelion/
├── packages/
│   ├── core-gomoku/          # 核心游戏逻辑 (框架无关)
│   ├── client-vue/           # Vue 3 + Vite 客户端
│   ├── client-angular/       # Angular 19 客户端
│   └── client-react/         # React 18 + Vite 客户端
├── pnpm-workspace.yaml       # pnpm 工作区配置
├── package.json              # 根配置
└── README.md
```

## 🚀 快速开始

### 前置要求

- **Node.js**: >= 18.19.0 (推荐使用 >= 22.x LTS，Angular 19 需要)
- **pnpm**: >= 8.x (推荐使用 `npm install -g pnpm` 安装)

> 💡 **提示**: 如果您使用 fnm 管理 Node.js 版本，可以运行 `fnm use 22.16.0` 切换到兼容版本。

### 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

这个命令会自动安装所有包的依赖，并建立内部包之间的链接关系。

### 构建核心库

在运行客户端之前，需要先构建核心游戏逻辑库：

```bash
pnpm build:core
```

### 运行客户端

#### 统一导航页面

项目根目录提供了一个 `index.html` 导航页面，可以方便地在三个框架版本之间切换：

```bash
# 使用任意 HTTP 服务器打开导航页面，例如：
npx serve .

# 或使用 Python
python3 -m http.server 8000
```

然后在浏览器中访问 http://localhost:8000 即可看到统一的导航界面。

#### 同时运行所有客户端

```bash
pnpm dev
```

这将同时启动三个框架的开发服务器：
- **Vue**: http://localhost:5173
- **React**: http://localhost:5174
- **Angular**: http://localhost:4200

#### 单独运行某个客户端

```bash
# 运行 Vue 版本
pnpm dev:vue

# 运行 React 版本
pnpm dev:react

# 运行 Angular 版本
pnpm dev:angular
```

## 🎮 游戏规则

1. **黑子先手**: 游戏开始时黑子先下
2. **轮流落子**: 玩家轮流在棋盘交叉点上落子
3. **五子连珠**: 先形成横、竖、斜任意方向的五子连线者获胜
4. **不可悔棋**: 已落下的棋子不可移动
5. **禁止重复落子**: 已有棋子的位置不能再次落子

## 🏗️ 核心架构

### `core-gomoku` - 核心游戏引擎

位于 `packages/core-gomoku`，提供框架无关的五子棋核心逻辑。

#### 核心 API

```typescript
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku'

const game = new GomokuGame()

// 落子
const result = game.makeMove(7, 7)

// 获取棋盘状态
const board = game.getBoardState()

// 获取当前玩家
const player = game.getCurrentPlayer()

// 检查游戏是否结束
const isOver = game.isGameOver()

// 获取游戏状态
const status = game.getGameStatus()

// 重置游戏
game.reset()
```

#### 主要功能

- ✅ **状态管理**: 维护 15×15 棋盘状态
- ✅ **落子验证**: 检查位置合法性、是否已占用
- ✅ **胜负判定**: 四方向（横、竖、左斜、右斜）检测五子连珠
- ✅ **回合管理**: 自动切换玩家
- ✅ **游戏状态**: 进行中、黑胜、白胜、平局

### 客户端实现

各客户端从 `core-gomoku` 导入游戏逻辑，专注于 UI 渲染和用户交互：

#### Vue 3 实现
- 使用 **Composition API** (`ref`, `computed`)
- 响应式状态管理
- 单文件组件 (SFC)

#### React 18 实现
- 使用 **Hooks** (`useState`, `useCallback`)
- 函数组件
- CSS Modules

#### Angular 19 实现
- 使用 **Standalone Components**
- 依赖注入
- TypeScript 装饰器

## 🎨 UI 设计特色

1. **渐变背景**: 每个框架使用不同的现代渐变配色
   - Vue: 紫色渐变 (#667eea → #764ba2)
   - React: 粉红渐变 (#f093fb → #f5576c)
   - Angular: 蓝色渐变 (#4facfe → #00f2fe)

2. **动画效果**:
   - 棋子落下动画 (dropIn)
   - 最后落子高亮 (highlight)
   - 框架标签脉冲动画 (pulse)
   - 按钮悬停效果

3. **玻璃态设计**: 使用 `backdrop-filter` 实现半透明毛玻璃效果

4. **响应式布局**: 适配不同屏幕尺寸

## 📝 构建与部署

### 构建所有项目

```bash
pnpm build:all
```

这将：
1. 构建 `core-gomoku` 库
2. 并行构建所有三个客户端应用

### 构建产物

- **core-gomoku**: `packages/core-gomoku/dist/`
- **client-vue**: `packages/client-vue/dist/`
- **client-react**: `packages/client-react/dist/`
- **client-angular**: `packages/client-angular/dist/`

## 🔧 技术栈

| 项目 | 技术栈 |
|-----|-------|
| **core-gomoku** | TypeScript, tsup |
| **client-vue** | Vue 3.5, TypeScript, Vite 6 |
| **client-react** | React 18, TypeScript, Vite 6 |
| **client-angular** | Angular 19, TypeScript, Angular CLI |
| **工具链** | pnpm workspace, ESM/CommonJS |

## ✅ 验收标准检查

### 1. 依赖关系验证

查看各客户端的 `package.json`，确认都依赖了 `@gomoku-monorepo/core-gomoku`:

```json
{
  "dependencies": {
    "@gomoku-monorepo/core-gomoku": "workspace:*"
  }
}
```

### 2. 功能一致性测试

在三个客户端中执行相同的操作序列，验证：
- ✅ 黑子先手规则
- ✅ 非法落子处理（已占用位置）
- ✅ 五子连珠判定（横、竖、斜）
- ✅ 游戏结束状态
- ✅ 重置功能

### 3. 构建验证

```bash
# 验证核心库构建
cd packages/core-gomoku && pnpm build

# 验证客户端构建
pnpm build:all
```

## 🎯 开发指南

### 修改核心逻辑

如果需要修改游戏规则：

1. 编辑 `packages/core-gomoku/src/game.ts`
2. 重新构建核心库：`pnpm build:core`
3. 所有客户端将自动使用新逻辑（无需修改客户端代码）

### 添加新客户端

1. 在 `packages/` 下创建新的客户端目录
2. 在 `package.json` 中添加 `@gomoku-monorepo/core-gomoku` 依赖
3. 导入并使用核心库 API
4. 添加相应的开发脚本到根 `package.json`

## 🤝 贡献指南

本项目展示了 Mono Repo 架构的最佳实践：

- **关注点分离**: 业务逻辑与视图完全解耦
- **代码复用**: 一份逻辑，多个框架共享
- **类型安全**: 全栈 TypeScript，端到端类型检查
- **构建优化**: 使用 pnpm workspace 提升安装速度

## 📄 License

MIT

---

**Built with ❤️ using Mono Repo Architecture**
