# TabMark — 产品设计文档

## 1. 产品概述

### 一句话定义

TabMark 是一个 Chrome 扩展，将标签页、书签、阅读列表、最近关闭等浏览器原生能力统一到一个新标签页中，让用户在一个界面内掌控所有关注的网页。

### 核心问题

Chrome 用户的两个高频痛点完全割裂：

- **标签页混乱**：开了 30+ 个标签页，找不到想要的，不敢关又怕丢。标签页标题被压缩到只剩 favicon，完全看不清。
- **书签积灰**：收藏了几百个书签，分类混乱、死链一堆、找不到想要的，最终再也不打开书签管理器。

这两个东西在 Chrome 里是完全独立的功能，但对用户来说是同一个需求：**管理我关注的网页**。

Chrome 还有多个与此相关但分散在各处的原生能力（最近关闭的标签页、常用网站、阅读列表、浏览历史），TabMark 将它们整合到同一个界面中。

### 产品定位

纯本地、零依赖、不需要服务器、不需要 API Key。一个 Chrome 扩展解决所有问题。

---

## 2. 目标用户

- 日常开 20+ 标签页的重度浏览器用户
- 有收藏习惯但书签管理长期失控的用户
- 开发者、研究人员、产品经理等信息密集型工作者

---

## 3. 网页生命周期（产品概念模型）

一个网页在用户的关注视野中会经历不同的状态。Chrome 将每个状态的管理分散在不同的功能入口中，用户需要去不同的地方才能找到自己关注的页面。TabMark 的核心理念是：**将整个生命周期统一到一个界面中管理**。

```
                    ┌─────────────────┐
                    │    Open tab     │
                    │   正在浏览的页面  │
                    └──┬──────┬───┬───┘
                       │      │   │
              ┌────────┘      │   └────────┐
              ▼               ▼            ▼
     ┌────────────────┐ ┌──────────┐ ┌──────────────┐
     │   Hibernate    │ │  Read    │ │  Close tab   │
     │  休眠节省内存   │ │  Later   │ │  关闭标签页   │
     │  仍在标签列表   │ │  稍后再读 │ │              │
     └────────────────┘ └────┬─────┘ └──────┬───────┘
                             │              │
                             ▼              ▼
                       ┌──────────┐  ┌──────────────┐
                       │ Bookmark │  │   Recently   │
                       │ 长期收藏  │  │   Closed     │
                       │          │  │  可恢复的页面  │
                       └────┬─────┘  └──────────────┘
                            │
                    时间流逝，记忆模糊
                            │
                            ▼
                       ┌──────────┐
                       │ History  │
                       │ 看过但没  │
                       │ 收藏的页面 │
                       └──────────┘
```

**各状态对应的 Chrome 原生 API 与 TabMark 功能映射：**

| 生命周期状态 | 含义 | Chrome API | TabMark 功能 | 阶段 |
|-------------|------|-----------|-------------|------|
| Open tab | 正在浏览 | `chrome.tabs` | Tabs 视图 — 分组卡片网格 | Phase 1 |
| Hibernate | 休眠中（仍在标签列表，但释放内存） | `chrome.tabs.discard()` | Tabs 视图 — 休眠操作 | Phase 2 |
| Close tab | 刚关闭，可恢复 | `chrome.sessions` | Tabs 视图 — 最近关闭区域 | Phase 1 |
| Read Later | 想看但还没看 | `chrome.readingList` | Read Later 视图 | Phase 3 |
| Bookmark | 长期收藏 | `chrome.bookmarks` | Bookmarks 视图 | Phase 1 |
| Top Sites | 高频访问 | `chrome.topSites` | Tabs 视图 — 常用网站卡片行 | Phase 1 |
| History | 看过但没收藏 | `chrome.history` | 统一搜索 — 最近浏览分组 | Phase 3 |

**用户的典型操作路径：**

- 打开的标签页太多 → **分组浏览** → 不需要的组 **批量关闭** → 误关了 → 从 **最近关闭** 恢复
- 看到一篇好文章 → **加入稍后读** → 读完后 → **转为书签** 长期保存
- 想找之前看过的页面 → **统一搜索** → 如果还开着就跳转，收藏了就打开，都没有就从历史记录找
- 标签页开太多卡了 → **休眠不活跃的分组** → 需要时点击自动唤醒
- 书签积灰 → **健康检查** → 清理死链和重复

这个生命周期模型确保了 TabMark 的功能不是随意堆砌，而是围绕"一个网页从打开到遗忘"的完整路径进行覆盖。

---

## 4. 功能规划

### 4.1 新标签页（New Tab Override）

替代 Chrome 默认新标签页，作为整个扩展的主界面入口。页面采用侧栏导航 + 主内容区的双栏布局。

**布局结构：**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │          │  │                                              │ │
│  │  LOGO    │  │  🔍 Search tabs, bookmarks, history... ⌘K   │ │
│  │          │  │                                              │ │
│  │──────────│  ├──────────────────────────────────────────────┤ │
│  │          │  │                                              │ │
│  │  ◉ Tabs  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │ │
│  │          │  │  │ Top  │ │ Top  │ │ Top  │ │ Top  │       │ │
│  │  ◉ Book- │  │  │ Site │ │ Site │ │ Site │ │ Site │       │ │
│  │   marks  │  │  └──────┘ └──────┘ └──────┘ └──────┘       │ │
│  │          │  │                                              │ │
│  │  ◉ Read  │  │  ── Development (4 tabs) ── [休眠] [收藏] [关闭]│
│  │   Later  │  │  ◉ github.com/repo/issues/42                │ │
│  │          │  │  ◉ github.com/repo/pull/18                   │ │
│  │──────────│  │  ◉ stackoverflow.com/questions/...           │ │
│  │          │  │                                              │ │
│  │  ◉ Health│  │  ── Research (2 tabs) ──── [休眠] [收藏] [关闭]│
│  │   Check  │  │  ◉ arxiv.org/abs/2401.xxxxx                 │ │
│  │          │  │  ◉ scholar.google.com/...                    │ │
│  │──────────│  │                                              │ │
│  │          │  │  ── Recently Closed ──────────────────────── │ │
│  │  ⚙ 设置  │  │  ◉ example.com/page (2 min ago) [恢复]      │ │
│  │          │  │  ◉ docs.google.com/... (15 min ago) [恢复]   │ │
│  │          │  │                                              │ │
│  └──────────┘  └──────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**布局说明：**

- **左侧栏（固定宽度 ~200px）**：导航菜单，切换不同视图。在 Bookmarks 视图下，侧栏内容变为文件夹树 + 标签云。窄屏时侧栏可折叠为图标模式。
- **主内容区**：根据侧栏选中的视图展示对应内容。
- **搜索栏**：固定在主内容区顶部，始终可见。⌘K 聚焦。默认搜索当前视图内容，支持 `@all` 前缀触发跨视图统一搜索。Phase 3 扩展搜索范围至阅读列表和最近浏览。
- **常用网站**：在 Tabs 视图顶部以小卡片行展示（最多 8 个），保留 Chrome 默认新标签页的快捷入口能力。

### 4.2 标签页管理（Tabs）

#### 4.2.1 标签页总览

- 以卡片网格展示当前所有打开的标签页
- 每张卡片包含：favicon、标题、域名、所属窗口标识
- Phase 2 增加：休眠状态灰显 + 标识
- 点击卡片 → 跳转到该标签页（`chrome.tabs.update`，不新开标签）
- 卡片上的关闭按钮 → 关闭该标签页

#### 4.2.2 智能分组（规则引擎，不用 AI）

按规则自动将标签页聚合为"任务组"，规则优先级从高到低：

1. **Chrome 标签页分组**：如果用户已经使用了 Chrome 内置的 Tab Groups，直接沿用其分组和颜色
2. **用户自定义规则**（Phase 3）：用户在设置中配置的规则（如"所有 GitHub 的标签页归为 Development"）
3. **域名聚合**：同一域名下的标签页自动归为一组（如 3 个 stackoverflow.com 页面归为 "Stack Overflow" 组）
4. **未分组**：不匹配任何规则的标签页归入"Other"组

> Phase 1 仅实现规则 1（Chrome 分组）和规则 3（域名聚合），自定义规则在 Phase 3 的设置页面中实现。

#### 4.2.3 批量操作（Phase 1 基础关闭 / Phase 2 完整批量）

Phase 1 支持单个标签页的关闭和跳转。Phase 2 增加以下分组级批量操作：

- **全部关闭**：关闭一个分组下的所有标签页
- **全部收藏**：将一个分组下的所有标签页保存为书签（保存到一个新建文件夹，以组名命名）
- **休眠分组**：挂起分组内所有标签页释放内存（`chrome.tabs.discard()`）
- **关闭重复**：检测并关闭 URL 相同的重复标签页（保留最新的那个）
- **关闭其他窗口**：只保留当前窗口的标签页

#### 4.2.4 标签页休眠（Phase 2）

通过 `chrome.tabs.discard()` 挂起不活跃的标签页，释放内存但保留在列表中。

- **手动休眠**：单个标签页或按分组批量休眠
- **自动策略**：超过 N 分钟不活跃自动休眠（默认 30 分钟，可在设置中调整或关闭）
- **视觉区分**：休眠中的标签页卡片灰显 + "Zzz" 标识，点击后自动唤醒并跳转

#### 4.2.5 最近关闭的标签页

通过 `chrome.sessions` API 获取最近关闭的标签页。

- 展示在 Tabs 视图底部，独立区域
- 每条显示：favicon、标题、域名、关闭时间（相对时间，如"5 分钟前"）
- 点击 → 恢复该标签页
- 最多显示最近 20 条

#### 4.2.6 常用网站（Top Sites）

通过 `chrome.topSites` API 获取用户最常访问的网站。

- 在 Tabs 视图顶部以紧凑卡片行展示，最多 8 个
- 每张卡片：大 favicon + 网站名称
- 点击 → 新标签页打开
- 替代 Chrome 默认新标签页的快捷方式功能

#### 4.2.7 标签页快照（Session Save）（Phase 2）

用户可以将当前所有标签页的状态保存为一个"快照"，之后一键恢复。

- 快照存储在 `chrome.storage.local`
- 包含：所有标签页 URL + 标题 + 分组信息 + 保存时间
- 用户可命名快照（如 "周一工作状态"、"论文阅读"）
- 恢复快照时，打开所有保存的 URL
- 入口：侧栏"Tabs"旁的快照图标，或 Tabs 视图右上角

### 4.3 书签管理（Bookmarks）

选中侧栏"Bookmarks"后，侧栏内容切换为书签专用导航。

#### 4.3.1 书签浏览

- 侧栏切换为：文件夹树 + 标签云
- 主区域：当前文件夹下的书签列表
- 每条书签显示：favicon、标题、域名、所在路径、添加日期、标签（tags）
- 支持列表视图和卡片视图切换

#### 4.3.2 搜索与筛选

顶部统一搜索栏在 Bookmarks 视图下自动切换为书签搜索模式：

- 模糊匹配：标题、URL、文件夹路径、标签
- 搜索结果按相关度排序（标题命中 > 标签命中 > URL 命中 > 路径命中）
- 搜索结果高亮关键词
- 侧栏标签云和文件夹树可作为筛选条件叠加使用

> 搜索栏在不同视图下的行为：Tabs 视图搜 tabs，Bookmarks 视图搜 bookmarks，输入前缀 `@all` 可触发跨视图统一搜索。

#### 4.3.3 标签系统（Tags）（Phase 2）

Chrome 书签原生不支持标签，通过 `chrome.storage.local` 扩展：

- Hover 书签行 → 出现"添加标签"按钮
- 标签输入支持已有标签的自动补全
- 可通过标签筛选书签（侧栏显示所有标签云）
- 标签数据结构：`{ [bookmarkId]: string[] }`

#### 4.3.4 批量操作（Phase 2）

- 多选 → 批量删除、批量移动到文件夹、批量添加标签
- 拖拽排序（单个拖拽移动位置）
- 拖拽到侧栏文件夹 → 移动到目标文件夹

### 4.4 阅读列表（Read Later）（Phase 3）

整合 Chrome 原生阅读列表（`chrome.readingList` API），作为标签页和书签之间的"中间态"。

- 侧栏独立入口"Read Later"
- 展示所有阅读列表项目，区分已读/未读
- 操作：标记已读、从阅读列表移除、转存为书签
- Tabs 视图的标签页卡片增加"稍后读"操作，将当前标签页加入阅读列表并关闭

### 4.5 健康检查（Health Check）（Phase 2）

#### 4.5.1 死链检测

- 在 Service Worker 中运行（避免 CORS 问题）
- 并发 5 路，HEAD 请求 + GET 降级
- 结果分类：正常 / 失效（4xx/5xx）/ 超时 / 跳转
- 进度条实时显示检测进度
- 一键删除所有死链

#### 4.5.2 重复检测

- URL 归一化后（去 trailing slash、去 UTM 参数、去 hash）比对
- 展示重复组，标记建议保留项（最早收藏的）
- 一键清理重复

### 4.6 统一搜索（Quick Search）

#### 新标签页内搜索

- 主内容区顶部搜索栏，⌘K 聚焦
- 搜索栏默认搜索当前视图内容（Tabs 视图搜 tabs，Bookmarks 视图搜 bookmarks）
- 输入前缀 `@all` 或在空白视图下搜索时，触发跨视图统一搜索
- 结果分组展示：
  - 「已打开」→ 点击跳转到该标签页
  - 「已收藏」→ 点击新标签页打开
  - 「稍后读」（Phase 3）→ 点击新标签页打开
  - 「最近浏览」（Phase 3）→ 点击新标签页打开
- 键盘导航：↑↓ 选择，Enter 打开，Esc 关闭

> Phase 1 搜索范围：标签页 + 书签。Phase 3 新增阅读列表 + 最近浏览。

#### 全局快捷搜索（Phase 3）

- ⌘⇧B 在任意页面唤出浮层搜索
- Content Script + Shadow DOM 实现
- 搜索逻辑同上

### 4.7 最近浏览（Recent History）（Phase 3）

通过 `chrome.history` API 获取最近几天的浏览记录，轻量展示用户"看过但没收藏的页面"。

- 不是完整的历史记录管理器，只展示最近 3 天、去重后的浏览记录
- 出现在统一搜索结果中（「最近浏览」分组）
- 主要价值：帮用户找到"前两天看过但没收藏也没开着的那个页面"

### 4.8 智能收藏（Smart Save）（Phase 3）

- Content Script 监听 Ctrl+D / ⌘D
- 弹出自定义收藏面板（替代 Chrome 默认的简陋弹窗）
- 自动推荐文件夹：分析当前页面域名，找已有书签中同域名最多的文件夹
- 支持同时添加标签
- 可选择"加入阅读列表"而非收藏

---

## 5. 信息架构

```
新标签页（newtab.html）
├── 侧栏导航
│   ├── Tabs（默认视图）
│   ├── Bookmarks → 侧栏变为文件夹树 + 标签云
│   ├── Read Later（Phase 3）
│   ├── Health Check（Phase 2）
│   └── Settings（跳转设置页面）
│
├── 搜索栏（固定顶部，当前视图搜索 + @all 跨视图搜索）
│
├── Tabs 视图
│   ├── 常用网站卡片行（Top Sites）
│   ├── 分组列表 / 卡片网格
│   │   └── 每组：组名 + 操作（休眠/收藏/关闭）
│   ├── 最近关闭的标签页
│   └── 快照管理入口
│
├── Bookmarks 视图
│   ├── 书签列表 / 卡片网格（主区域）
│   ├── 批量操作栏
│   └── 标签筛选
│
├── Read Later 视图（Phase 3）
│   └── 阅读列表项目（未读 / 已读）
│
└── Health Check 视图
    ├── 死链检测
    └── 重复检测

Service Worker（background.ts）
├── 死链检测执行器
├── 标签页休眠调度器
├── 消息路由
└── 快捷键监听

Content Script（Phase 3）
├── 全局搜索浮层（Shadow DOM）
└── 智能收藏面板
```

---

## 6. 数据模型

### 数据来源与存储

| 数据 | 来源 | 存储位置 |
|------|------|----------|
| 标签页列表 | `chrome.tabs` API（实时查询） | 不存储，每次实时获取 |
| 书签树 | `chrome.bookmarks` API | Chrome 内置存储 |
| 阅读列表 | `chrome.readingList` API（实时查询） | Chrome 内置存储 |
| 最近关闭的标签页 | `chrome.sessions` API（实时查询） | Chrome 内置存储 |
| 常用网站 | `chrome.topSites` API（实时查询） | Chrome 内置存储 |
| 最近浏览 | `chrome.history` API（实时查询） | Chrome 内置存储 |
| 标签（Tags） | 用户手动添加 | `chrome.storage.local` |
| 分组规则 | 用户设置 | `chrome.storage.local` |
| 标签页快照 | 用户手动保存 | `chrome.storage.local` |
| 休眠策略 | 用户设置 | `chrome.storage.local` |
| 用户偏好 | 设置页面 | `chrome.storage.local` |

### storage.local 数据结构

```typescript
interface StorageSchema {
  // 书签标签
  bookmarkTags: Record<string, string[]>;
  // 标签页分组规则
  groupingRules: GroupingRule[];
  // 标签页快照
  sessions: Session[];
  // 用户偏好
  preferences: UserPreferences;
}

interface GroupingRule {
  id: string;
  name: string;                // 组名，如 "Development"
  patterns: string[];          // 匹配的域名或 URL 模式
}

interface Session {
  id: string;
  name: string;
  createdAt: number;
  tabs: {
    url: string;
    title: string;
    groupName?: string;
  }[];
}

interface UserPreferences {
  theme: "dark" | "light" | "system";  // 默认 "system"
  defaultView: "tabs" | "bookmarks";
  bookmarkViewMode: "list" | "grid";
  showFavicons: boolean;
  showTopSites: boolean;
  topSitesCount: number;              // 默认 8，最大 10
  hibernation: {
    enabled: boolean;
    idleMinutes: number;              // 默认 30
  };
}
```

---

## 7. 权限声明

```json
{
  "permissions": [
    "bookmarks",
    "tabs",
    "tabGroups",
    "favicon",
    "storage",
    "sessions",
    "topSites"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  }
}
```

Phase 2 新增（健康检查需要）：

```json
{
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

> 注意：Manifest V3 下 Service Worker 的 `fetch` 同样受 CORS 限制，死链检测必须声明 `host_permissions` 才能正常发起跨域请求。此权限在 Phase 2 引入健康检查时添加。

各权限用途：

| 权限 | 用途 | 阶段 |
|------|------|------|
| `bookmarks` | 读写书签 | Phase 1 |
| `tabs` | 读取和操作标签页，休眠/唤醒 | Phase 1 |
| `tabGroups` | 读取 Chrome 标签页分组信息 | Phase 1 |
| `favicon` | 获取网站图标 | Phase 1 |
| `storage` | 存储标签、快照、设置 | Phase 1 |
| `sessions` | 获取最近关闭的标签页 | Phase 1 |
| `topSites` | 获取用户常用网站 | Phase 1 |
| `host_permissions` | 死链检测需要跨域请求 | Phase 2 |

Phase 3 新增：

| 权限 | 用途 | 阶段 |
|------|------|------|
| `readingList` | 读写阅读列表 | Phase 3 |
| `history` | 读取最近浏览记录 | Phase 3 |
| `activeTab` | 智能收藏需要读取当前页面信息 | Phase 3 |
| `scripting` | 注入 Content Script | Phase 3 |

不需要的权限：
- ❌ `cookies` — 不涉及认证
- ❌ `downloads` — 不涉及下载管理

---

## 8. 技术选型与架构

### 8.1 技术栈

| 选择 | 方案 | 理由 |
|------|------|------|
| 框架 | WXT + React + TypeScript | WXT 处理扩展工程化，React 处理 UI |
| 样式 | Tailwind CSS | 快速开发，`dark:` 前缀原生支持明暗适配 |
| 状态管理 | Zustand | 1KB 体积，选择性订阅避免 Chrome 事件回调引发的无效重渲染 |
| 拖拽 | @dnd-kit/core | React 生态最活跃的拖拽库，Phase 2 引入 |
| 构建 | Vite（WXT 内置） | 快速 HMR，开发体验好 |

### 8.2 状态管理架构

按数据域拆分为独立的 Zustand store，每个 store 内部初始化时加载数据并监听对应的 Chrome 事件，实现事件驱动的实时更新。

```
┌─────────────────────────────────────────────┐
│              New Tab Page (UI)              │
│                                             │
│  useTabStore ──── useBookmarkStore           │
│       │                │                    │
│  useSessionStore  useTopSitesStore           │
│       │                │                    │
│  usePreferenceStore   useReadingListStore    │
│                       (Phase 3)             │
└──────────┬──────────────────────────────────┘
           │ chrome.runtime.sendMessage
           ▼
┌─────────────────────────────────────────────┐
│          Service Worker (background.ts)     │
│                                             │
│  - 死链检测执行器（Phase 2）                  │
│  - 休眠调度器（Phase 2）                      │
│  - 消息路由                                  │
└─────────────────────────────────────────────┘
```

**Store 拆分：**

| Store | 数据源 | 监听事件 | 阶段 |
|-------|--------|---------|------|
| `useTabStore` | `chrome.tabs` | `onCreated` / `onRemoved` / `onUpdated` / `onMoved` | Phase 1 |
| `useTabGroupStore` | `chrome.tabGroups` | `onCreated` / `onRemoved` / `onUpdated` | Phase 1 |
| `useBookmarkStore` | `chrome.bookmarks` | `onCreated` / `onRemoved` / `onChanged` / `onMoved` | Phase 1 |
| `useSessionStore` | `chrome.sessions` | 无事件，标签页变化时主动刷新 | Phase 1 |
| `useTopSitesStore` | `chrome.topSites` | 无事件，页面加载时获取一次 | Phase 1 |
| `useTagStore` | `chrome.storage.local` | `onChanged` | Phase 2 |
| `usePreferenceStore` | `chrome.storage.local` | `onChanged` | Phase 1 |
| `useReadingListStore` | `chrome.readingList` | `onEntryAdded` / `onEntryRemoved` / `onEntryUpdated` | Phase 3 |
| `useHistoryStore` | `chrome.history` | 无事件，搜索时按需查询 | Phase 3 |

**订阅粒度原则：** 组件只订阅自己需要的字段。Tabs 视图的标签页变化不触发 Bookmarks 视图重渲染，反之亦然。

### 8.3 消息通信

新标签页（UI）与 Service Worker 之间通过 `chrome.runtime.sendMessage` 通信。所有消息采用统一的类型化格式：

```typescript
type Message =
  | { type: "HEALTH_CHECK_START"; payload: { bookmarkIds: string[] } }
  | { type: "HEALTH_CHECK_PROGRESS"; payload: HealthResult }
  | { type: "HEALTH_CHECK_COMPLETE"; payload: HealthResult[] }
  | { type: "HIBERNATE_TABS"; payload: { tabIds: number[] } }
  | { type: "HIBERNATE_AUTO_TICK" };
```

**通信方向：**

- **UI → Service Worker**：发起死链检测、触发批量休眠等重操作
- **Service Worker → UI**：检测进度回调、休眠状态变更通知（通过 `chrome.runtime.sendMessage` 广播，UI 侧 store 内监听）

### 8.4 样式策略

不同运行环境的样式方案不同：

| 环境 | 方案 | 原因 |
|------|------|------|
| 新标签页（newtab.html） | Tailwind CSS | 独立页面，无样式冲突风险 |
| 设置页面（options.html） | Tailwind CSS | 同上 |
| Content Script 浮层（Phase 3） | Shadow DOM + 内联样式 / CSS Modules | 注入到第三方页面，必须样式隔离，Tailwind 的全局类名会与宿主页面冲突 |

**明暗主题实现：**

- Tailwind 的 `darkMode` 配置为 `"class"`
- 页面加载时读取 `usePreferenceStore` 的 `theme` 值：
  - `"system"` → 监听 `window.matchMedia('(prefers-color-scheme: dark)')` 变化，动态切换 `<html class="dark">`
  - `"dark"` / `"light"` → 直接设置对应 class
- CSS 变量定义核心颜色，供 Tailwind 和非 Tailwind 环境共用

### 8.5 项目目录结构

```
tabmark/
├── entrypoints/
│   ├── newtab/               # 新标签页（主界面）
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── options/              # 设置页面
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   └── background.ts        # Service Worker
│
├── components/               # 通用 UI 组件
│   ├── Sidebar.tsx
│   ├── SearchBar.tsx
│   ├── TabCard.tsx
│   ├── TabGroup.tsx
│   ├── BookmarkList.tsx
│   ├── BookmarkRow.tsx
│   ├── TopSites.tsx
│   ├── RecentlyClosed.tsx
│   ├── HealthCheckPanel.tsx
│   └── SnapshotModal.tsx
│
├── stores/                   # Zustand stores
│   ├── tabStore.ts
│   ├── tabGroupStore.ts
│   ├── bookmarkStore.ts
│   ├── sessionStore.ts
│   ├── topSitesStore.ts
│   ├── tagStore.ts
│   ├── preferenceStore.ts
│   └── readingListStore.ts   # Phase 3
│
├── utils/                    # 工具函数
│   ├── bookmarks.ts          # 书签树扁平化、去重、格式化
│   ├── grouping.ts           # 标签页分组规则引擎
│   ├── search.ts             # 模糊搜索、评分排序
│   ├── healthCheck.ts        # 死链检测逻辑
│   └── favicon.ts            # Favicon URL 生成
│
├── hooks/                    # 自定义 React hooks
│   ├── useSearch.ts          # 搜索逻辑 hook
│   ├── useDebouncedValue.ts
│   └── useKeyboardNav.ts     # 搜索结果键盘导航
│
├── styles/
│   └── global.css            # Tailwind 入口 + CSS 变量
│
├── wxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 8.6 性能考量

新标签页每次 Cmd+T 都会加载，首屏速度直接影响用户体验。

**目标**：首屏渲染 < 200ms

**策略：**

- Chrome API 调用并行化：`Promise.all([chrome.tabs.query(), chrome.topSites.get(), chrome.sessions.getRecentlyClosed()])` 一次性发出，不串行等待
- Store 初始化延迟加载：`useBookmarkStore` 仅在切换到 Bookmarks 视图时初始化（书签树可能很大），Tabs 相关 store 在页面加载时立即初始化
- 搜索防抖：输入时 150ms debounce，避免每次按键都触发全量搜索
- 书签搜索做 Web Worker 离线计算（如果书签量 > 1000 条）
- 大列表虚拟滚动：书签列表超过 200 条时启用（可选用 `@tanstack/react-virtual`）

### 8.7 Phase 3 Content Script 架构

全局搜索浮层和智能收藏面板通过 Content Script 注入到任意页面：

```
任意网页
├── 宿主页面 DOM
└── <div id="tabmark-root">
    └── #shadow-root (closed)
        ├── <style> 内联样式 </style>
        └── <div class="tabmark-overlay">
            └── React 渲染的搜索/收藏面板
        </div>
```

- 使用 **closed Shadow DOM** 防止宿主页面访问内部结构
- 样式完全内联在 Shadow DOM 内，不使用 Tailwind
- React 通过 `createRoot(shadowRoot)` 挂载到 Shadow DOM 内
- 与 Service Worker 通信获取搜索结果，不直接调用 Chrome API（Content Script 的 API 权限有限）

---

## 9. 开发分期

### Phase 1：核心骨架（MVP）

**目标**：新标签页可用，tabs 和 bookmarks 基础功能跑通。

- 新标签页替换 + 侧栏导航 + 顶部搜索栏（搜索范围：tabs + bookmarks）
- Tabs 视图：标签页卡片网格 + 域名自动分组 + 点击跳转 + 关闭
- Tabs 视图：常用网站卡片行（Top Sites）
- Tabs 视图：最近关闭的标签页 + 一键恢复
- Bookmarks 视图：文件夹树 + 书签列表 + 模糊搜索
- 明暗主题自适应（跟随系统 + 手动切换）

**预估**：3-5 天

### Phase 2：管理能力

**目标**：让管理操作真正好用。

- 标签页批量操作（关闭分组、收藏分组、关闭重复）
- 标签页休眠（手动 + 自动策略）
- 书签批量操作（多选删除、移动、添加标签）
- 拖拽排序
- 标签系统（Tags）
- 健康检查（死链 + 重复，移到 Service Worker）
- 标签页快照（Session Save）

**预估**：5-7 天

### Phase 3：体验提升 + 扩展整合

**目标**：打磨交互、整合更多浏览器原生能力。

- 阅读列表整合（Read Later 视图）
- 最近浏览（Recent History，轻量展示 + 纳入搜索）
- 全局快捷搜索（⌘⇧B，Content Script + Shadow DOM）
- 智能收藏面板（替代 Chrome 默认 Ctrl+D）
- 用户自定义分组规则（设置页面）
- 关闭动画（参考 Tab Out 的 swoosh + confetti）
- 搜索结果关键词高亮

**预估**：5-7 天

---

## 10. 页面清单（供设计参考）

以下是需要设计的所有页面/视图：

### 10.1 新标签页 — 整体框架

- 左侧固定导航栏（~200px）：Logo + 导航项 + 设置入口
- 导航项：Tabs / Bookmarks / Read Later（Phase 3） / Health Check（Phase 2）
- Phase 1 侧栏仅显示 Tabs 和 Bookmarks，其余导航项随对应阶段解锁
- 当前选中项高亮
- 窄屏时侧栏折叠为图标模式（~56px）
- 主内容区顶部固定搜索栏

### 10.2 新标签页 — Tabs 视图

**区域 A：常用网站（顶部）**
- 紧凑的卡片行，最多 8 个
- 每张：大 favicon（32px）+ 网站简称
- 可在设置中关闭此区域

**区域 B：标签页分组（主体）**
- 按分组展示的标签页卡片
- 每个分组头部：组名 + 标签页数量 + 操作按钮（休眠 / 收藏 / 关闭）
- 每张卡片：favicon + 标题 + 域名 + 关闭按钮
- 休眠中的卡片灰显 + 休眠标识
- 重复标签页标记

**区域 C：最近关闭（底部）**
- "Recently Closed" 标题 + 最近关闭的标签页列表
- 每条：favicon + 标题 + 域名 + 相对时间 + 恢复按钮
- 默认显示 5 条，可展开查看更多（最多 20 条）

**状态：空状态**
- 仅一个标签页时的友好提示

### 10.3 新标签页 — Bookmarks 视图

进入 Bookmarks 视图时，侧栏内容变为：
- "All Bookmarks" 按钮
- 文件夹树形导航
- 分隔线
- 标签云（所有已使用的 tags）

主区域：
- 书签列表（列表模式 / 卡片模式可切换）
- 顶部操作栏：批量选择后出现（已选 N 项 + 删除 / 移动 / 加标签）
- 每行书签：checkbox + favicon + 标题 + 域名 + 路径 + 日期 + tags + 操作（加标签 / 删除）

### 10.4 新标签页 — Read Later 视图（Phase 3）

- 两个 Tab 切换：未读 / 已读
- 每条：favicon + 标题 + 域名 + 添加时间
- 操作：标记已读、转存为书签、删除
- 空状态提示

### 10.5 新标签页 — Health Check 视图（Phase 2）

- 顶部：开始检查按钮 + 进度条
- Tab 切换：死链 / 重复
- 死链列表：标题 + 域名 + 状态码 + 删除按钮 + 批量清理
- 重复列表：按 URL 分组，标记保留项，其余可删除

### 10.6 统一搜索结果（搜索栏下拉）

- 分组展示：
  - 「已打开的标签页」（跳转图标）
  - 「稍后阅读」（Phase 3）
  - 「收藏的书签」（外链图标）
  - 「最近浏览」（Phase 3，时钟图标）
- 每条结果：favicon + 标题 + URL 摘要 + 来源标签
- 键盘导航：↑↓ 选择，Enter 打开，Esc 关闭
- 无结果时提示"No results"

### 10.7 快照管理弹窗

- 快照列表：名称 + 保存时间 + 标签页数量
- 操作：恢复 / 重命名 / 删除
- 保存快照：输入名称 → 保存当前状态

### 10.8 设置页面（Options Page）

- 外观：主题切换（跟随系统 / 浅色 / 暗色），默认跟随系统
- 默认视图：新标签页默认展示 Tabs 还是 Bookmarks
- 常用网站：显示/隐藏、数量（4/6/8）
- 休眠策略：开启/关闭、空闲阈值（分钟）
- 分组规则管理：添加 / 编辑 / 删除自定义规则
- 数据管理：导出标签数据 / 清除所有标签数据

### 10.9 Phase 3 页面

- 全局搜索浮层（⌘⇧B）：居中的搜索框 + 下拉结果，类似 Spotlight
- 智能收藏面板（Ctrl+D）：URL + 标题 + 文件夹选择（带推荐）+ 标签输入 + "加入阅读列表"选项

---

## 11. 设计要求

### 视觉风格

- 自适应设备明暗模式（`prefers-color-scheme`），默认跟随系统，支持手动切换
- 设计稿需同时提供亮色和暗色两套视觉
- 现代、干净、信息密度适中
- 参考风格：Linear、Raycast、Arc Browser
- 避免过于花哨的装饰，注重可读性和操作效率

### 交互原则

- 快捷键优先：搜索 ⌘K、关闭 ⌘W 等常用操作有快捷键
- 操作可撤销：删除/关闭操作弹出 toast 允许撤销（5 秒内）
- 实时反馈：标签页变化（新开/关闭）在界面上实时更新
- 拖拽直觉化：拖到文件夹 = 移动，拖拽排序有吸附反馈
- 视图记忆：记住用户上次使用的视图，下次打开新标签页时直接展示

### 响应式

- 新标签页需要适配不同窗口宽度
- 侧栏在窄屏（<900px）折叠为图标模式
- 卡片网格列数自适应
- 常用网站卡片行在窄屏减少显示数量

---

## 12. 项目名称候选

| 名称 | 含义 |
|------|------|
| TabMark | Tab + Bookmark 的组合 |
| Nexus Tab | 连接点，汇聚 tabs 和 bookmarks |
| Orbit | 围绕用户的浏览轨道 |
| Stash | 藏起来的东西，暗示收纳整理 |

建议使用 **TabMark**，简洁直观。
