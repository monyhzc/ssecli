const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { postAPI, getAPI } = require('./api/client');
const { getConfig } = require('./config');

const server = new McpServer({
  name: 'ssecli',
  version: '1.0.0',
});

// ============================================
// READ OPERATIONS
// ============================================

server.tool('browse_posts', 'Browse posts (Read)', {
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
  sort: z.string().optional().default('home'),
  search: z.string().optional().default(''),
  partition: z.string().optional().default(''),
  tag: z.string().optional().default(''),
  type: z.string().optional().default(''),
}, async ({ limit, offset, sort, search, partition, tag, type }) => {
  try {
    const cfg = getConfig();
    const result = await postAPI('/api/auth/browse', {
      UserTelephone: cfg.userPhone || '',
      Partition: partition,
      Searchinfo: search,
      Tag: tag,
      Searchsort: sort,
      Limit: limit,
      Offset: offset,
      PostType: type,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_post_detail', 'Get post details (Read)', {
  postId: z.number(),
}, async ({ postId }) => {
  try {
    const result = await postAPI('/api/auth/showDetails', { PostID: postId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_post_comments', 'Get comments for a post (Read)', {
  postId: z.number(),
}, async ({ postId }) => {
  try {
    const cfg = getConfig();
    const result = await postAPI('/api/auth/showPcomments', {
      userTelephone: cfg.userPhone || '',
      postID: postId,
      postType: 'post',
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_post_types', 'Get post types (Read)', {}, async () => {
  try {
    const result = await postAPI('/api/auth/getPostTypes', {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_post_count', 'Get post count (Read)', {}, async () => {
  try {
    const result = await postAPI('/api/auth/getPostNum', {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('browse_products', 'Browse products (Read)', {
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
  sort: z.string().optional().default('home'),
  search: z.string().optional().default(''),
}, async ({ limit, offset, sort, search }) => {
  try {
    const result = await postAPI('/api/auth/getProducts', {
      Searchinfo: search,
      Searchsort: sort,
      Limit: limit,
      Offset: offset,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_product_detail', 'Get product details (Read)', {
  productId: z.number(),
}, async ({ productId }) => {
  try {
    const result = await postAPI('/api/auth/getProductDetail', { ProductID: productId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_product_count', 'Get product count (Read)', {
  search: z.string().optional().default(''),
  sort: z.string().optional().default('home'),
}, async ({ search, sort }) => {
  try {
    const result = await postAPI('/api/auth/getProductNum', {
      Searchinfo: search,
      Searchsort: sort,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_carousel_images', 'Get carousel images (Read)', {}, async () => {
  try {
    const result = await postAPI('/api/auth/getCarouselImg', {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_user_info', 'Get user info (Read)', {}, async () => {
  try {
    const result = await getAPI('/api/auth/info');
    return { content: [{ type: 'text', text: JSON.stringify(result?.data ?? result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_user_profile', 'Get user profile (Read)', {}, async () => {
  try {
    const cfg = getConfig();
    const result = await postAPI('/api/auth/getInfo', { phone: cfg.userPhone || '' });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_user_statistics', 'Get user statistics (Read)', {}, async () => {
  try {
    const result = await postAPI('/api/auth/statistics', {});
    return { content: [{ type: 'text', text: JSON.stringify(result?.data ?? result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_tags', 'Get all tags (Read)', {}, async () => {
  try {
    const result = await getAPI('/api/auth/getTags');
    return { content: [{ type: 'text', text: JSON.stringify(result?.data ?? result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_notices', 'Get notices (Read)', {}, async () => {
  try {
    const result = await getAPI('/api/auth/getNotice');
    return { content: [{ type: 'text', text: JSON.stringify(result?.data ?? result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('get_notice_count', 'Get notice count (Read)', {}, async () => {
  try {
    const result = await getAPI('/api/auth/getNoticeNum');
    return { content: [{ type: 'text', text: JSON.stringify(result?.data ?? result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

// ============================================
// WRITE OPERATIONS
// ============================================

server.tool('create_post', 'Create post (Write)', {
  title: z.string(),
  content: z.string(),
  partition: z.string().optional().default(''),
  photos: z.string().optional().default(''),
  tags: z.string().optional().default(''),
}, async ({ title, content, partition, photos, tags }) => {
  try {
    const cfg = getConfig();
    const result = await postAPI('/api/auth/post', {
      UserTelephone: cfg.userPhone || '',
      Title: title,
      Content: content,
      Partition: partition,
      Photos: photos,
      TagList: tags,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('delete_post', 'Delete post (Write)', {
  postId: z.number(),
}, async ({ postId }) => {
  try {
    const result = await postAPI('/api/auth/deletePost', { PostID: postId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('toggle_like_post', 'Like/unlike post (Write)', {
  postId: z.number(),
}, async ({ postId }) => {
  try {
    const result = await postAPI('/api/auth/updateLike', { PostID: postId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('toggle_save_post', 'Save/unsave post (Write)', {
  postId: z.number(),
}, async ({ postId }) => {
  try {
    const result = await postAPI('/api/auth/updateSave', { PostID: postId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('create_comment', 'Create comment or reply (Write)', {
  postId: z.number(),
  content: z.string(),
  parentCommentId: z.number().optional(),
}, async ({ postId, content, parentCommentId }) => {
  try {
    const cfg = getConfig();
    let result;
    if (parentCommentId) {
      result = await postAPI('/api/auth/postCcomment', {
        UserTelephone: cfg.userPhone || '',
        PcommentID: parentCommentId,
        Content: content,
      });
    } else {
      result = await postAPI('/api/auth/postPcomment', {
        UserTelephone: cfg.userPhone || '',
        PostID: postId,
        Content: content,
      });
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('delete_comment', 'Delete comment (Write)', {
  commentId: z.number(),
}, async ({ commentId }) => {
  try {
    const result = await postAPI('/api/auth/deletePcomment', { PcommentID: commentId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('create_product', 'Create product (Write)', {
  title: z.string(),
  content: z.string(),
  price: z.number(),
  photos: z.string().optional().default(''),
  anonymous: z.boolean().optional().default(false),
}, async ({ title, content, price, photos, anonymous }) => {
  try {
    const cfg = getConfig();
    const result = await postAPI('/api/auth/postProduct', {
      Title: title,
      Content: content,
      Price: price,
      Photos: photos ? photos.split(',') : [],
      ISAnonymous: anonymous,
      UserTelephone: cfg.userPhone || '',
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('delete_product', 'Delete product (Write)', {
  productId: z.number(),
}, async ({ productId }) => {
  try {
    const result = await postAPI('/api/auth/deleteProduct', { ProductID: productId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('mark_product_sold', 'Mark product as sold (Write)', {
  productId: z.number(),
}, async ({ productId }) => {
  try {
    const result = await postAPI('/api/auth/saleProduct', { ProductID: productId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('update_profile', 'Update profile (Write)', {
  username: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
}, async ({ username, bio, avatar }) => {
  try {
    const cfg = getConfig();
    const data = { userID: cfg.userID };
    if (username) data.name = username;
    if (bio) data.intro = bio;
    if (avatar) data.avatarURL = avatar;
    const result = await postAPI('/api/auth/updateUserInfo', data);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('mark_notice_read', 'Mark notice as read (Write)', {
  noticeId: z.number(),
}, async ({ noticeId }) => {
  try {
    const result = await postAPI(`/api/auth/readNotice/${noticeId}`, {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('submit_feedback', 'Submit feedback (Write)', {
  content: z.string(),
}, async ({ content }) => {
  try {
    const result = await postAPI('/api/auth/submitFeedback', { content });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

// ============================================
// RAW API
// ============================================

server.tool('api_get', 'Raw GET API call (Read)', {
  endpoint: z.string(),
  params: z.string().optional().default('{}'),
}, async ({ endpoint, params }) => {
  try {
    let parsedParams = {};
    try { parsedParams = JSON.parse(params); } catch {}
    const result = await getAPI(endpoint, parsedParams);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

server.tool('api_post', 'Raw POST API call (Write)', {
  endpoint: z.string(),
  body: z.string().optional().default('{}'),
}, async ({ endpoint, body }) => {
  try {
    let parsedBody = {};
    try { parsedBody = JSON.parse(body); } catch {}
    const result = await postAPI(endpoint, parsedBody);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SSE Market MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
