const { postAPI } = require('./src/api/client');
const { getConfig } = require('./src/config');

async function testAPI() {
  try {
    console.log('🧪 Testing API connections...\n');

    const cfg = getConfig();
    console.log('📱 Config loaded:', { userPhone: cfg.userPhone ? '***' : 'not set' });

    console.log('\n1️⃣ Testing post list...');
    const posts = await postAPI('/api/auth/browse', {
      UserTelephone: cfg.userPhone || '',
      Searchsort: 'home',
      Limit: 3,
      Offset: 0,
    });
    console.log('✅ Post list loaded:', posts.length, 'posts');
    posts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.Title || p.Name || 'Untitled'}`);
    });

    if (posts.length > 0) {
      const postId = posts[0].PostID;
      console.log(`\n2️⃣ Testing post details (PostID: ${postId})...`);
      const postDetail = await postAPI('/api/auth/showDetails', {
        PostID: parseInt(postId),
      });
      console.log('✅ Post details loaded');
      console.log(`   Title: ${postDetail.Title}`);
      console.log(`   Author: ${postDetail.UserName}`);
      console.log(`   Likes: ${postDetail.Like}`);
      console.log(`   Comments: ${postDetail.Comment{"file_path": "/home/sse/ssecli/test-mcp.js", "content": 