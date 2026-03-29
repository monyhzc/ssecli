# 🤖 SSECLI - Agentic 原生论坛终端

> *当 Agentic 设计遇上校园论坛，Bot 与 Human 共享同一套接口*

**GitHub**: https://github.com/monyhzc/ssecli

---

## ✨ 这不仅仅是一个 CLI

SSECLI 是一个 **Agentic 原生** 的命令行工具，采用 Bot 与 Human 双向兼容的设计理念。无论是人类用户手动操作，还是 AI Bot 自动化执行，都可以通过同一套命令行接口无缝切换。

这不仅仅是一个 CLI。这是碳基生命与硅基生命的握手，是键盘敲击与神经网络计算的共鸣，是 **Agentic 原生** 的终极诠释。

---

## 🧠 Agentic 能力

SSECLI 的设计理念是 **Agentic-Native**：

- **🤖 统一接口** - Bot 和 Human 使用完全相同的命令，零学习成本
- **⚡ 程序化操作** - 所有功能都可通过命令行调用，完美适配自动化工作流
- **📊 结构化输出** - 支持 JSON、表格等多种格式，方便 Bot 解析和 Human 阅读
- **🧭 导航记忆** - 内置导航系统，支持连续操作和状态保持
- **🔗 无缝集成** - 可直接接入 **Claude Code**、**OpenClaw** 等 AI 编程助手

---

## 🚀 快速开始

```bash
# 安装
git clone https://github.com/monyhzc/ssecli.git
cd ssecli
npm install
npm link

# 登录
ssecli auth login <email> <password>

# 浏览帖子
ssecli post list

# 导航
ssecli next        # 下一个
ssecli prev        # 上一个
ssecli curr        # 显示当前
```

---

## 📖 命令

### 帖子 (Post)

| 命令 | 说明 |
|------|------|
| `ssecli post` | 浏览最新帖子 |
| `ssecli post list` | 列出帖子 |
| `ssecli post get <id>` | 获取帖子详情 |
| `ssecli post create` | 创建新帖子 |
| `ssecli post delete <id>` | 删除帖子 |
| `ssecli post like <id>` | 点赞/取消点赞 |
| `ssecli post comment <id> <content>` | 评论帖子 |
| `ssecli post subcomment <id> <content>` | 回复评论 |
| `ssecli post delete-comment <id>` | 删除评论 |
| `ssecli post +hot` | 浏览热门帖子 |
| `ssecli post +save` | 浏览收藏帖子 |
| `ssecli post +rating` | 浏览评分最高的帖子 |

### 商品 (Product)

| 命令 | 说明 |
|------|------|
| `ssecli product` | 浏览最新商品 |
| `ssecli product list` | 列出商品 |
| `ssecli product get <id>` | 获取商品详情 |
| `ssecli product create` | 创建新商品 |
| `ssecli product delete <id>` | 删除商品 |
| `ssecli product +latest` | 浏览最新5个商品 |
| `ssecli product +my` | 浏览我的商品 |

### 用户 (User)

| 命令 | 说明 |
|------|------|
| `ssecli user info` | 获取当前用户信息 |
| `ssecli user profile` | 获取详细用户资料 |
| `ssecli user notices` | 获取通知 |
| `ssecli user statistics` | 获取用户统计信息 |

### 认证 (Auth)

| 命令 | 说明 |
|------|------|
| `ssecli auth login <email> <password>` | 登录 |
| `ssecli auth register <email> <password> <username>` | 注册 |
| `ssecli auth logout` | 退出登录 |

### 导航 (Navigation)

| 命令 | 说明 |
|------|------|
| `ssecli next` | 下一个 |
| `ssecli prev` | 上一个 |
| `ssecli curr` | 显示当前 |

---

## 🛠 接入你的 AI 助手

```bash
# 让 Claude Code 帮你发布帖子
claude "用 ssecli 发布一个帖子，标题是..."

# 让 AI 助手浏览帖子
ssecli post list --format json | your-ai-bot

# 或者你自己手动操作 - 没错，同一个命令
ssecli post list
```

---

## 🤝 贡献指南

**发现问题？不要只说，直接修！**

我们相信行动胜于言语。如果你发现 bug、有新想法，或者想改进文档：

1. Fork 本仓库
2. 创建你的功能分支
3. 提交你的修改
4. 发起 Pull Request

**Pull Request 永远欢迎！** 每一个 PR 都会让这个项目变得更好。

---

## 📄 许可证

MIT
