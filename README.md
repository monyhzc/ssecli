# ssecli

A command-line tool for SSE Market - built for humans and AI Agents.

## Installation

```bash
git clone https://github.com/monyhzc/ssecli.git
cd ssecli
npm install
npm link
```

## Quick Start

```bash
# Configure (default: https://ssemarket.cn)
ssecli config init

# Login
ssecli auth login <email> <password>

# Browse posts/products with navigation
ssecli post        # Browse latest posts
ssecli next        # Next item
ssecli prev        # Previous item
ssecli curr        # Show current item
```

## Commands

### Post

| Command | Description |
|---------|-------------|
| `ssecli post` | Browse latest posts |
| `ssecli post list` | List posts (with `--nav` for navigation mode) |
| `ssecli post get <id>` | Get post detail |
| `ssecli post create` | Create a new post |
| `ssecli post delete <id>` | Delete a post |
| `ssecli post like <id>` | Like/unlike a post |
| `ssecli post comment <id> <content>` | Comment on a post |
| `ssecli post +hot` | Browse hot posts |
| `ssecli post +save` | Browse saved posts |
| `ssecli post +rating` | Browse top rated posts |

### Product

| Command | Description |
|---------|-------------|
| `ssecli product` | Browse latest products |
| `ssecli product list` | List products |
| `ssecli product get <id>` | Get product detail |
| `ssecli product create` | Create a new product |
| `ssecli product delete <id>` | Delete a product |
| `ssecli product sale <id>` | Mark as sold |
| `ssecli product +latest` | Browse latest 5 products |
| `ssecli product +my` | Browse my products |

### User

| Command | Description |
|---------|-------------|
| `ssecli user info` | Get current user info |
| `ssecli user profile` | Get detailed user profile |
| `ssecli user update` | Update user profile |
| `ssecli user notices` | Get notices |
| `ssecli user notices-count` | Get notice count |
| `ssecli user statistics` | Get user statistics |
| `ssecli user feedback <content>` | Submit feedback |
| `ssecli user tags` | Get all tags |

### Auth

| Command | Description |
|---------|-------------|
| `ssecli auth login <email> <password>` | Login |
| `ssecli auth register <email> <password> <username>` | Register |
| `ssecli auth me` | Get detailed user info |
| `ssecli auth update-profile` | Update user profile |
| `ssecli auth refresh` | Refresh access token |
| `ssecli auth logout` | Logout |
| `ssecli auth status` | Check authentication status |

### Config

| Command | Description |
|---------|-------------|
| `ssecli config init` | Initialize configuration |
| `ssecli config show` | Show current configuration |
| `ssecli config set <key> <value>` | Set a configuration value |

### Navigation

| Command | Description |
|---------|-------------|
| `ssecli next` | Go to next item |
| `ssecli prev` | Go to previous item |
| `ssecli curr` | Show current item |
| `ssecli nav next` | Go to next item (subcommand) |
| `ssecli nav prev` | Go to previous item (subcommand) |
| `ssecli nav curr` | Show current item (subcommand) |

### API

| Command | Description |
|---------|-------------|
| `ssecli api get <endpoint>` | GET request |
| `ssecli api post <endpoint>` | POST request |
| `ssecli api list` | List all available endpoints |

## Output Formats

Use `--format <format>` to control output (default varies by command):

- `json` - JSON output
- `table` - ASCII table
- `list` - Compact list format
- `pretty` - Pretty printed with separators

## Features

- Quick navigation: `next` / `prev` / `curr`
- Tree-format comments display
- Multiple output formats
- Built-in navigation history with pagination
- AI-friendly structured output
- Custom API base URL support

## License

MIT
