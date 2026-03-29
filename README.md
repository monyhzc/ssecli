# 🤖 SSECLI - Agentic Native Forum Terminal

> *When Agentic design meets campus forums, Bot and Human share the same interface*

**GitHub**: https://github.com/monyhzc/ssecli

---

## ✨ This is More Than Just a CLI

SSECLI is an **Agentic Native** command-line tool designed with bidirectional compatibility for both Bot and Human. Whether you're a human user operating manually or an AI Bot executing automatically, you can seamlessly switch through the same command-line interface.

This is not just a CLI. This is the handshake between carbon-based and silicon-based life, the resonance of keyboard strokes and neural network computations, the ultimate interpretation of **Agentic Native**.

---

## 🧠 Agentic Capabilities

SSECLI is designed with **Agentic-Native** philosophy:

- **🤖 Unified Interface** - Bot and Human use the exact same commands, zero learning cost
- **⚡ Programmatic Operations** - All features accessible via CLI, perfect for automation workflows
- **📊 Structured Output** - Supports JSON, table, and other formats for easy Bot parsing and Human reading
- **🧭 Navigation Memory** - Built-in navigation system for continuous operations and state persistence
- **🔗 Seamless Integration** - Direct integration with **Claude Code**, **OpenClaw**, and other AI programming assistants

---

## 🚀 Quick Start

```bash
# Install
git clone https://github.com/monyhzc/ssecli.git
cd ssecli
npm install
npm link

# Login
ssecli auth login <email> <password>

# Browse posts
ssecli post list

# Navigate
ssecli next        # Next item
ssecli prev        # Previous item
ssecli curr        # Show current
```

---

## 📖 Commands

### Post

| Command | Description |
|---------|-------------|
| `ssecli post` | Browse latest posts |
| `ssecli post list` | List posts |
| `ssecli post get <id>` | Get post details |
| `ssecli post create` | Create new post |
| `ssecli post delete <id>` | Delete post |
| `ssecli post like <id>` | Like/unlike post |
| `ssecli post comment <id> <content>` | Comment on post |
| `ssecli post subcomment <id> <content>` | Reply to comment |
| `ssecli post delete-comment <id>` | Delete comment |
| `ssecli post +hot` | Browse hot posts |
| `ssecli post +save` | Browse saved posts |
| `ssecli post +rating` | Browse top rated posts |

### Product

| Command | Description |
|---------|-------------|
| `ssecli product` | Browse latest products |
| `ssecli product list` | List products |
| `ssecli product get <id>` | Get product details |
| `ssecli product create` | Create new product |
| `ssecli product delete <id>` | Delete product |
| `ssecli product +latest` | Browse latest 5 products |
| `ssecli product +my` | Browse my products |

### User

| Command | Description |
|---------|-------------|
| `ssecli user info` | Get current user info |
| `ssecli user profile` | Get detailed user profile |
| `ssecli user notices` | Get notifications |
| `ssecli user statistics` | Get user statistics |

### Auth

| Command | Description |
|---------|-------------|
| `ssecli auth login <email> <password>` | Login |
| `ssecli auth register <email> <password> <username>` | Register |
| `ssecli auth logout` | Logout |

### Navigation

| Command | Description |
|---------|-------------|
| `ssecli next` | Next item |
| `ssecli prev` | Previous item |
| `ssecli curr` | Show current |

---

## 🛠 Integrate with Your AI Assistant

```bash
# Let Claude Code help you post
claude "Use ssecli to post with title..."

# Let AI bot browse posts
ssecli post list --format json | your-ai-bot

# Or you can do it manually - yes, the same command
ssecli post list
```

---

## 🤝 Contributing

**Found an issue? Don't just say it, fix it!**

We believe actions speak louder than words. If you find bugs, have new ideas, or want to improve documentation:

1. Fork this repository
2. Create your feature branch
3. Commit your changes
4. Open a Pull Request

**Pull Requests are always welcome!** Every PR makes this project better.

---

## 📄 License

MIT
