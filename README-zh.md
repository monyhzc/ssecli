# ssecli

SSE Market 命令行工具 - 专为人类和 AI 代理设计。

## 安装

```bash
git clone https://github.com/monyhzc/ssecli.git
cd ssecli
npm install
npm link
```

## 快速开始

```bash
# 配置（默认: https://ssemarket.cn）
ssecli config init

# 登录
ssecli auth login <邮箱> <密码>

# 浏览帖子/商品并导航
ssecli post        # 浏览最新帖子
ssecli next        # 下一个
ssecli prev        # 上一个
ssecli curr        # 显示当前
```

## 命令

### 帖子 (Post)

| 命令 | 说明 |
|------|------|
| `ssecli post` | 浏览最新帖子 |
| `ssecli post list` | 列出帖子（加 `--nav` 启用导航模式） |
| `ssecli post get <id>` | 获取帖子详情 |
| `ssecli post create` | 创建新帖子 |
| `ssecli post delete <id>` | 删除帖子 |
| `ssecli post like <id>` | 点赞/取消点赞 |
| `ssecli post comment <id> <内容>` | 评论帖子 |
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
| `ssecli product sale <id>` | 标记为已售 |
| `ssecli product +latest` | 浏览最新5个商品 |
| `ssecli product +my` | 浏览我的商品 |

### 用户 (User)

| 命令 | 说明 |
|------|------|
| `ssecli user info` | 获取当前用户信息 |
| `ssecli user profile` | 获取详细用户资料 |
| `ssecli user update` | 更新用户资料 |
| `ssecli user notices` | 获取通知 |
| `ssecli user notices-count` | 获取通知数量 |
| `ssecli user statistics` | 获取用户统计信息 |
| `ssecli user feedback <内容>` | 提交反馈 |
| `ssecli user tags` | 获取所有标签 |

### 认证 (Auth)

| 命令 | 说明 |
|------|------|
| `ssecli auth login <邮箱> <密码>` | 登录 |
| `ssecli auth register <邮箱> <密码> <用户名>` | 注册 |
| `ssecli auth me` | 获取详细用户信息 |
| `ssecli auth update-profile` | 更新用户资料 |
| `ssecli auth refresh` | 刷新访问令牌 |
| `ssecli auth logout` | 退出登录 |
| `ssecli auth status` | 检查认证状态 |

### 配置 (Config)

| 命令 | 说明 |
|------|------|
| `ssecli config init` | 初始化配置 |
| `ssecli config show` | 显示当前配置 |
| `ssecli config set <键> <值>` | 设置配置项 |

### 导航 (Navigation)

| 命令 | 说明 |
|------|------|
| `ssecli next` | 下一个 |
| `ssecli prev` | 上一个 |
| `ssecli curr` | 显示当前 |
| `ssecli nav next` | 下一个（子命令） |
| `ssecli nav prev` | 上一个（子命令） |
| `ssecli nav curr` | 显示当前（子命令） |

### API

| 命令 | 说明 |
|------|------|
| `ssecli api get <端点>` | GET 请求 |
| `ssecli api post <端点>` | POST 请求 |
| `ssecli api list` | 列出所有可用端点 |

## 输出格式

使用 `--format <格式>` 控制输出（不同命令默认值不同）：

- `json` - JSON 格式输出
- `table` - ASCII 表格
- `list` - 紧凑列表格式
- `pretty` - 带分隔符的格式化输出

## 特性

- 快速导航：`next` / `prev` / `curr`
- 树状评论显示
- 多种输出格式
- 内置导航历史，支持分页
- AI 友好的结构化输出
- 支持自定义 API 地址

## 许可证

MIT
