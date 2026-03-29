const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { postAPI, getAPI } = require('./api/client');
const { getConfig } = require('./config');

const server = new McpServer({
  name: 'ssecli',
  version: '1.0.0',
});

server.tool(
  'list_posts',
  'List posts from SSE Market',
  {
    limit: z.number().optional().default(10).describe('Number of posts to list'),
    offset: z.number().optional().default(0).describe('Offset for pagination'),
    sort: z.string().optional().default('home').describe('Sorting method (home/history/save/rating)'),
    search: z.string().optional().default('').describe('Search keyword'),
    partition: z.string().optional().default('').describe('Partition'),
  },
  async ({ limit, offset, sort, search, partition }) => {
    try {
      const cfg = getConfig();
      const result = await postAPI('/api/auth/browse', {
        UserTelephone: cfg.userPhone || '',
        Partition: partition,
        Searchinfo: search,
        Tag: '',
        Searchsort: sort,
        Limit: limit,
        Offset: offset,
        PostType: '',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'get_post',
  'Get post details by PostID',
  {
    postId: z.number().describe('Post ID'),
  },
  async ({ postId }) => {
    try {
      const result = await postAPI('/api/auth/showDetails', {
        PostID: parseInt(postId),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'get_comments',
  'Get comments for a post',
  {
    postId: z.number().describe('Post ID'),
  },
  async ({ postId }) => {
    try {
      const cfg = getConfig();
      const result = await postAPI('/api/auth/showPcomments', {
        userTelephone: cfg.userPhone || '',
        postID: parseInt(postId),
        postType: 'post',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'create_comment',
  'Comment on a post',
  {
    postId: z.number().describe('Post ID'),
    content: z.string().describe('Comment content'),
  },
  async ({ postId, content }) => {
    try {
      const cfg = getConfig();
      const result = await postAPI('/api/auth/postPcomment', {
        UserTelephone: cfg.userPhone || '',
        PostID: parseInt(postId),
        Content: content,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'like_post',
  'Like or unlike a post',
  {
    postId: z.number().describe('Post ID'),
  },
  async ({ postId }) => {
    try {
      const result = await postAPI('/api/auth/updateLike', {
        PostID: parseInt(postId),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'save_post',
  'Save or unsave a post',
  {
    postId: z.number().describe('Post ID'),
  },
  async ({ postId }) => {
    try {
      const result = await postAPI('/api/auth/updateSave', {
        PostID: parseInt(postId),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'list_products',
  'List products from marketplace',
  {
    limit: z.number().optional().default(10).describe('Number of products to list'),
  },
  async ({ limit }) => {
    try {
      const cfg = getConfig();
      const result = await postAPI('/api/product/list', {
        UserTelephone: cfg.userPhone || '',
        Limit: limit,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'raw_api_post',
  'Make a raw POST API call',
  {
    endpoint: z.string().describe('API endpoint'),
    body: z.string().optional().default('{}').describe('JSON body string'),
  },
  async ({ endpoint, body }) => {
    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = {};
      }

      const result = await postAPI(endpoint, parsedBody);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SSE Market MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
