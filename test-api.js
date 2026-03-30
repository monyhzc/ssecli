const { postAPI } = require('./src/api/client');
const { getConfig } = require('./src/config');

async function testAPI() {
  try {
    console.log('🧪 Testing SSE Market API connections...\n');

    const cfg = getConfig();
    console.log('📱 Config loaded:', { 
      userPhone: cfg.userPhone ? '***' : 'not set',
      apiBaseUrl: cfg.apiBaseUrl 
    });

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
      console.log(`   Comments: ${postDetail.Comment}`);

      if (postDetail.Comment > 0) {
        console.log(`\n3️⃣ Testing comments (PostID: ${postId})...`);
        const comments = await postAPI('/api/auth/showPcomments', {
          userTelephone: cfg.userPhone || '',
          postID: parseInt(postId),
          postType: 'post',
        });
        console.log('✅ Comments loaded:', comments.length, 'comments');
      }
    }

    console.log('\n🎉 All tests passed! API is working correctly!');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response?.data) {
      console.error('📡 Server response:', error.response.data);
    }
  }
}

testAPI();
