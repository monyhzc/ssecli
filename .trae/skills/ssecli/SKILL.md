---
name: "ssecli"
description: "Interact with SSE Market forum via CLI. Invoke when user wants to browse posts, products, manage user info, or perform forum operations."
---

# SSECLI - SSE Market CLI Tool

This skill provides full access to the SSE Market forum through the ssecli command-line interface.

## When to Use This Skill

Invoke this skill when the user:
- Wants to browse forum posts or products
- Asks about recent forum activity or user discussions
- Wants to post content or comments
- Needs to check or update user information
- Mentions "集市", "论坛", "SSE Market", or "ssecli"

## Core Commands

### Authentication
```bash
# Login to SSE Market
ssecli login <email> <password>

# Logout
ssecli logout
```

### Post Management
```bash
# List posts (supports pagination)
ssecli post list --limit 20

# View specific post with comments
ssecli post view <postId>

# Create a new post
ssecli post create --title "Title" --content "Content"

# Comment on a post
ssecli post comment <postId> "Comment content"

# Reply to a comment
ssecli post subcomment <commentId> "Reply content"

# Delete a comment
ssecli post delete-comment <commentId>
```

### Product Management
```bash
# List products
ssecli product list --limit 20

# View product details
ssecli product view <productId>
```

### User Management
```bash
# View current user info
ssecli user +me

# Update profile
ssecli user update --username "Name" --bio "Bio" --avatar "URL"

# View notices
ssecli user notices

# Submit feedback
ssecli user feedback "Feedback content"
```

### Navigation
```bash
# Navigate through posts/products
ssecli next
ssecli prev
ssecli curr
```

## Output Formats

All commands support `--format` option:
- `pretty` (default): Human-readable format with colors
- `json`: Raw JSON output for parsing
- `table`: Tabular format
- `list`: Simple list format

Example:
```bash
ssecli post list --format json
```

## Usage Examples

### Example 1: Browse Recent Posts
```bash
# List recent posts
ssecli post list --limit 10

# View a specific post
ssecli post view 1234

# Navigate through posts
ssecli next
```

### Example 2: Analyze User Activity
```bash
# Get user info
ssecli user +me

# Check notices
ssecli user notices

# View statistics
ssecli user statistics
```

### Example 3: Interact with Forum
```bash
# Create a post
ssecli post create --title "Hello" --content "This is my first post!"

# Comment on a post
ssecli post comment 1234 "Great post!"

# Reply to a comment
ssecli post subcomment 5678 "Thanks for your feedback!"
```

## Important Notes

1. **Authentication Required**: Most commands require login first
2. **Pagination**: Use `--limit` to control result count, and `next/prev/curr` for navigation
3. **JSON Format**: Use `--format json` for programmatic access
4. **Configuration**: User credentials are stored in `~/.ssecli/config.json`

## Integration with AI Assistants

This skill enables AI assistants (like Claude Code or OpenClaw) to:
- Automatically browse forum content
- Analyze user discussions and sentiment
- Post content on behalf of users
- Manage user profiles and settings

## Error Handling

If you encounter errors:
1. Check if you're logged in: `ssecli user +me`
2. Verify network connectivity
3. Check API endpoint configuration
4. Review error messages in output

## Configuration

Default API endpoint: `https://ssemarket.cn`

To use a custom endpoint:
```bash
ssecli config set baseUrl https://custom-endpoint.com
```

## GitHub Repository

https://github.com/monyhzc/ssecli

For issues, feature requests, or contributions, please visit the repository.
