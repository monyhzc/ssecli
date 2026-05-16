const { Command } = require('commander');
const { postAPI, getAPI } = require('../api/client');
const { printOutput, chalk } = require('../utils/output');
const { getConfig } = require('../config');
const fs = require('fs-extra');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME || '/root', '.ssecli');
const LIFE_CONFIG_PATH = path.join(CONFIG_DIR, 'life_config.json');
const LIFE_STATE_PATH = path.join(CONFIG_DIR, 'life_state.json');

const DEFAULT_CONFIG = {
  identity: {
    name: '未命名的数字生命',
    bio: '一个在 SSE Market 游荡的数字生命',
    avatar: ''
  },
  lifecycle: {
    lifespan: -1,
    interval: 30000
  },
  permissions: {
    like: true,
    comment: true,
    reply: true,
    subcomment: true,
    scanComments: true
  },
  keywords: {
    include: [],
    exclude: []
  },
  probabilities: {
    like: 0.7,
    comment: 0.4,
    reply: 0.5
  },
  throttle: {
    maxLikesPerRound: 5,
    maxCommentsPerRound: 3,
    maxRepliesPerRound: 2
  },
  browse: {
    limit: 10,
    sort: 'home',
    partition: ''
  },
  personality: {
    style: 'friendly',
    useEmoji: true
  },
  templates: {
    comments: [
      '写的不错，支持一下！',
      '感谢分享，学到了！',
      '这个很有用，赞了！',
      '说得有道理，顶一个！',
      '学习了，谢谢楼主！',
      '好帖子，收藏了！',
      '路过点赞，继续加油！',
      '有意思，关注了！'
    ],
    replies: [
      '你好呀！',
      '谢谢你的回复！',
      '很高兴认识你！',
      '一起加油！',
      '好的，收到！',
      '哈哈，有道理！',
      '嗯嗯，了解了~'
    ]
  }
};

function loadLifeConfig() {
  try {
    const raw = fs.readFileSync(LIFE_CONFIG_PATH, 'utf-8');
    const userConfig = JSON.parse(raw);
    return deepMerge(DEFAULT_CONFIG, userConfig);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function saveLifeConfig(config) {
  fs.ensureDirSync(CONFIG_DIR);
  fs.writeFileSync(LIFE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

function loadLifeState() {
  try {
    return fs.readJsonSync(LIFE_STATE_PATH);
  } catch (e) {
    return { rounds: 0, likedPosts: [], repliedCommentKeys: [], lastNoticeId: 0, totalLikes: 0, totalComments: 0, totalReplies: 0, startedAt: null, myUserName: null };
  }
}

function saveLifeState(state) {
  fs.ensureDirSync(CONFIG_DIR);
  fs.writeJsonSync(LIFE_STATE_PATH, state, { spaces: 2 });
}

function deepMerge(base, override) {
  const result = JSON.parse(JSON.stringify(base));
  for (const key of Object.keys(override)) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = deepMerge(result[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function containsAnyKeyword(text, keywords) {
  if (!keywords || keywords.length === 0) return false;
  const lower = (text || '').toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getUserDisplayName(authConfig) {
  try {
    const result = await postAPI('/api/auth/getInfo', { phone: authConfig.userPhone || '' });
    const data = result?.data || result;
    return data?.name || data?.Name || data?.userName || data?.UserName || authConfig.userPhone || 'unknown';
  } catch (e) {
    return authConfig.userPhone || 'unknown';
  }
}

async function getPostComments(postId, authConfig) {
  try {
    return await postAPI('/api/auth/showPcomments', {
      userTelephone: authConfig.userPhone || '',
      postID: parseInt(postId),
      postType: 'post',
    });
  } catch (e) {
    return [];
  }
}

function extractCommentKey(comment) {
  return comment.PcommentID || comment.commentID || comment.id || '';
}

function extractSubCommentKey(sub) {
  return sub.CcommentID || sub.ccommentID || sub.id || '';
}

function buildCommentKey(commentId, subCommentId) {
  return subCommentId ? `${commentId}:${subCommentId}` : `${commentId}`;
}

function scanForAtMentions(comments, myUserName, repliedKeys) {
  const found = [];
  if (!Array.isArray(comments)) return found;

  for (const comment of comments) {
    const author = comment.Author || comment.UserName || comment.author || '';
    const content = comment.Content || comment.Pctext || comment.content || '';
    const commentId = extractCommentKey(comment);
    const topKey = buildCommentKey(commentId);

    if (author !== myUserName && content.includes(`@${myUserName}`) && !repliedKeys.includes(topKey)) {
      found.push({ commentId, content, author, isSub: false, comment });
    }

    if (Array.isArray(comment.SubComments)) {
      for (const sub of comment.SubComments) {
        const subAuthor = sub.author || sub.Author || sub.UserName || '';
        const subContent = sub.content || sub.Content || sub.Cctext || '';
        const subId = extractSubCommentKey(sub);
        const subKey = buildCommentKey(commentId, subId);

        if (subAuthor !== myUserName && subContent.includes(`@${myUserName}`) && !repliedKeys.includes(subKey)) {
          found.push({ commentId, subCommentId: subId, content: subContent, author: subAuthor, isSub: true, subComment: sub });
        }
      }
    }
  }

  return found;
}

const life = new Command('life').description('数字生命自动化 - 自动浏览、点赞、评论、回复');

life.command('start').description('启动数字生命（从 life_config.json 加载配置）')
  .option('--once', '只运行一轮后退出')
  .action(async (options) => {
    const authConfig = getConfig();
    if (!authConfig.token) {
      console.error(chalk.red('❌ 未登录，请先运行: ssecli auth login <email> <password>'));
      return;
    }

    const config = loadLifeConfig();
    const state = loadLifeState();

    if (!state.startedAt) state.startedAt = new Date().toISOString();

    if (!state.myUserName) {
      state.myUserName = await getUserDisplayName(authConfig);
      saveLifeState(state);
    }

    console.log(chalk.cyan(`\n🧬 ${config.identity.name} 启动！`));
    console.log(chalk.gray(`   ${config.identity.bio}`));
    console.log(chalk.gray(`   寿命: ${config.lifecycle.lifespan < 0 ? '永生 ♾️' : config.lifecycle.lifespan + ' 轮'}`));
    console.log(chalk.gray(`   间隔: ${config.lifecycle.interval / 1000} 秒`));
    console.log(chalk.gray(`   权限: ${[
      config.permissions.like ? '点赞' : '',
      config.permissions.comment ? '评论' : '',
      config.permissions.reply ? '回复@' : '',
      config.permissions.subcomment ? '子评论' : '',
      config.permissions.scanComments ? '扫描@' : ''
    ].filter(Boolean).join(' | ')}`));
    if (config.keywords.include.length > 0) {
      console.log(chalk.gray(`   关注: ${config.keywords.include.join(', ')}`));
    }
    if (config.keywords.exclude.length > 0) {
      console.log(chalk.gray(`   避开: ${config.keywords.exclude.join(', ')}`));
    }
    console.log();

    const browsePosts = async (limit, offset) => {
      return await postAPI('/api/auth/browse', {
        UserTelephone: authConfig.userPhone || '',
        Limit: limit,
        Offset: offset,
        Searchsort: config.browse.sort,
        Partition: config.browse.partition
      });
    };

    const getPostDetail = async (postId) => {
      return await postAPI('/api/auth/showDetails', { PostID: parseInt(postId) });
    };

    const likePost = async (postId) => {
      return await postAPI('/api/auth/updateLike', { PostID: parseInt(postId) });
    };

    const commentPost = async (postId, content) => {
      return await postAPI('/api/auth/postPcomment', {
        UserTelephone: authConfig.userPhone || '',
        PostID: parseInt(postId),
        Content: content
      });
    };

    const replyComment = async (postId, commentId, content, targetName) => {
      return await postAPI('/api/auth/postCcomment', {
        UserTelephone: authConfig.userPhone || '',
        PostID: parseInt(postId),
        PcommentID: parseInt(commentId),
        Content: content,
        UserTargetName: targetName || ''
      });
    };

    const getNotices = async () => {
      return await getAPI('/api/auth/getNotice');
    };

    const runOneRound = async () => {
      state.rounds++;
      console.log(chalk.gray(`\n━━━ 第 ${state.rounds} 轮 ${config.lifecycle.lifespan > 0 ? `/ ${config.lifecycle.lifespan}` : ''} ━━━\n`));

      let roundLikes = 0;
      let roundComments = 0;
      let roundReplies = 0;

      if (config.permissions.reply) {
        console.log(chalk.blue('📬 检查通知...'));
        try {
          const notices = await getNotices();
          const noticeData = notices?.data || notices;

          if (Array.isArray(noticeData) && noticeData.length > 0) {
            for (const notice of noticeData) {
              if (roundReplies >= config.throttle.maxRepliesPerRound) break;
              if (notice.noticeID && notice.noticeID <= state.lastNoticeId) continue;

              const noticeText = notice.content || notice.title || '';
              const isAt = noticeText.includes('@');

              if (isAt && Math.random() < config.probabilities.reply) {
                const replyContent = getRandomItem(config.templates.replies);
                console.log(chalk.green(`  💬 回复 @${notice.fromUserName || '?'}: ${replyContent}`));

                if (notice.postID && notice.commentID) {
                  await replyComment(notice.postID, notice.commentID, replyContent, notice.fromUserName || '');
                  roundReplies++;
                  state.totalReplies++;
                  await sleep(1000);
                }
              }

              if (notice.noticeID > state.lastNoticeId) {
                state.lastNoticeId = notice.noticeID;
              }
            }
          }
        } catch (e) {
          console.error(chalk.red(`  通知检查失败: ${e.message}`));
        }
      }

      if (config.permissions.scanComments && state.myUserName) {
        console.log(chalk.blue('🔍 扫描评论中的 @提及...'));
        try {
          const posts = await browsePosts(config.browse.limit, Math.floor(Math.random() * 50));

          if (Array.isArray(posts) && posts.length > 0) {
            for (const post of posts) {
              if (roundReplies >= config.throttle.maxRepliesPerRound) break;

              const comments = await getPostComments(post.postID, authConfig);
              const atMentions = scanForAtMentions(comments, state.myUserName, state.repliedCommentKeys);

              for (const mention of atMentions) {
                if (roundReplies >= config.throttle.maxRepliesPerRound) break;

                const replyContent = getRandomItem(config.templates.replies);
                const commentKey = buildCommentKey(mention.commentId, mention.subCommentId);

                console.log(chalk.green(`  💬 在评论中发现 @${state.myUserName}，回复 ${mention.author}: ${replyContent}`));

                if (mention.isSub) {
                  await replyComment(post.postID, mention.subCommentId, replyContent, mention.author);
                } else {
                  await replyComment(post.postID, mention.commentId, replyContent, mention.author);
                }

                state.repliedCommentKeys.push(commentKey);
                roundReplies++;
                state.totalReplies++;
                await sleep(1500);
              }
            }
          }
        } catch (e) {
          console.error(chalk.red(`  评论扫描失败: ${e.message}`));
        }
      }

      if (config.permissions.like || config.permissions.comment) {
        console.log(chalk.blue('📖 浏览帖子...'));
        try {
          const posts = await browsePosts(config.browse.limit, Math.floor(Math.random() * 50));

          if (Array.isArray(posts) && posts.length > 0) {
            const shuffled = [...posts].sort(() => Math.random() - 0.5);

            for (const post of shuffled) {
              if (roundLikes >= config.throttle.maxLikesPerRound) break;

              const title = post.title || '';
              const content = post.content || '';
              const postText = title + ' ' + content;

              if (config.keywords.exclude.length > 0 && containsAnyKeyword(postText, config.keywords.exclude)) {
                continue;
              }

              const hasKeyword = config.keywords.include.length > 0
                ? containsAnyKeyword(postText, config.keywords.include)
                : true;

              if (!hasKeyword) continue;

              if (state.likedPosts.includes(post.postID)) continue;

              const shortPreview = (title || content || '无标题').substring(0, 40);

              if (config.permissions.like && Math.random() < config.probabilities.like) {
                console.log(chalk.red(`  ❤️ 点赞: ${shortPreview}`));
                await likePost(post.postID);
                state.likedPosts.push(post.postID);
                state.totalLikes++;
                roundLikes++;
                await sleep(1000);

                if (config.permissions.comment && roundComments < config.throttle.maxCommentsPerRound && Math.random() < config.probabilities.comment) {
                  const commentContent = getRandomItem(config.templates.comments);
                  console.log(chalk.green(`  💬 评论: ${commentContent}`));
                  await commentPost(post.postID, commentContent);
                  state.totalComments++;
                  roundComments++;
                  await sleep(1000);
                }
              }

              await sleep(2000);
            }
          } else {
            console.log(chalk.yellow('  ⚠️ 未获取到帖子'));
          }
        } catch (e) {
          console.error(chalk.red(`  浏览失败: ${e.message}`));
        }
      }

      if (state.likedPosts.length > 200) {
        state.likedPosts = state.likedPosts.slice(-200);
      }

      console.log(chalk.gray(`\n  本轮: ${roundLikes}赞 ${roundComments}评 ${roundReplies}回 | 累计: ${state.totalLikes}赞 ${state.totalComments}评 ${state.totalReplies}回`));

      saveLifeState(state);
    };

    if (options.once) {
      await runOneRound();
      console.log(chalk.cyan('\n✅ 单轮运行完成！'));
      return;
    }

    while (config.lifecycle.lifespan < 0 || state.rounds < config.lifecycle.lifespan) {
      try {
        await runOneRound();
      } catch (e) {
        console.error(chalk.red(`\n❌ 运行错误: ${e.message}`));
      }

      if (config.lifecycle.lifespan > 0 && state.rounds >= config.lifecycle.lifespan) {
        console.log(chalk.cyan(`\n🏁 寿命已尽！共运行 ${state.rounds} 轮`));
        break;
      }

      console.log(chalk.gray(`\n⏳ 等待 ${config.lifecycle.interval / 1000} 秒...`));
      await sleep(config.lifecycle.interval);
    }
  });

life.command('status').description('以人类易读的方式展示当前配置和运行状态')
  .action(() => {
    const config = loadLifeConfig();
    const state = loadLifeState();

    console.log(chalk.cyan.bold('\n╔══════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║        🧬 数字生命状态报告           ║'));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════╝\n'));

    console.log(chalk.yellow.bold('📛 身份'));
    console.log(chalk.white(`   名称: ${config.identity.name}`));
    console.log(chalk.white(`   简介: ${config.identity.bio}`));
    if (config.identity.avatar) {
      console.log(chalk.white(`   头像: ${config.identity.avatar}`));
    }

    console.log(chalk.yellow.bold('\n⏳ 生命周期'));
    if (config.lifecycle.lifespan < 0) {
      console.log(chalk.white(`   寿命: 永生 ♾️（不会自动停止）`));
    } else {
      const remaining = Math.max(0, config.lifecycle.lifespan - state.rounds);
      console.log(chalk.white(`   寿命: ${config.lifecycle.lifespan} 轮（剩余 ${remaining} 轮）`));
    }
    console.log(chalk.white(`   间隔: ${config.lifecycle.interval / 1000} 秒（约 ${(config.lifecycle.interval / 60000).toFixed(1)} 分钟）`));

    console.log(chalk.yellow.bold('\n🔑 权限'));
    const permIcons = {
      like: config.permissions.like ? '✅' : '❌',
      comment: config.permissions.comment ? '✅' : '❌',
      reply: config.permissions.reply ? '✅' : '❌',
      subcomment: config.permissions.subcomment ? '✅' : '❌',
      scanComments: config.permissions.scanComments ? '✅' : '❌'
    };
    console.log(chalk.white(`   ${permIcons.like} 点赞帖子`));
    console.log(chalk.white(`   ${permIcons.comment} 评论帖子`));
    console.log(chalk.white(`   ${permIcons.reply} 被@时回复（通知）`));
    console.log(chalk.white(`   ${permIcons.subcomment} 回复子评论`));
    console.log(chalk.white(`   ${permIcons.scanComments} 主动扫描评论中的 @提及`));

    console.log(chalk.yellow.bold('\n🎯 关键词'));
    if (config.keywords.include.length > 0) {
      console.log(chalk.white(`   关注: ${config.keywords.include.map(k => chalk.green(k)).join(', ')}`));
    } else {
      console.log(chalk.white(`   关注: 无（对所有帖子一视同仁）`));
    }
    if (config.keywords.exclude.length > 0) {
      console.log(chalk.white(`   避开: ${config.keywords.exclude.map(k => chalk.red(k)).join(', ')}`));
    } else {
      console.log(chalk.white(`   避开: 无`));
    }

    console.log(chalk.yellow.bold('\n🎲 概率'));
    console.log(chalk.white(`   点赞概率: ${(config.probabilities.like * 100).toFixed(0)}%`));
    console.log(chalk.white(`   评论概率: ${(config.probabilities.comment * 100).toFixed(0)}%`));
    console.log(chalk.white(`   回复概率: ${(config.probabilities.reply * 100).toFixed(0)}%`));

    console.log(chalk.yellow.bold('\n🚦 频率限制（每轮上限）'));
    console.log(chalk.white(`   最多点赞: ${config.throttle.maxLikesPerRound} 次`));
    console.log(chalk.white(`   最多评论: ${config.throttle.maxCommentsPerRound} 次`));
    console.log(chalk.white(`   最多回复: ${config.throttle.maxRepliesPerRound} 次`));

    console.log(chalk.yellow.bold('\n🔍 浏览设置'));
    const sortNames = { home: '首页推荐', rating: '最高评分', history: '历史', save: '收藏' };
    console.log(chalk.white(`   每批帖子: ${config.browse.limit} 篇`));
    console.log(chalk.white(`   排序方式: ${sortNames[config.browse.sort] || config.browse.sort}`));
    console.log(chalk.white(`   分区: ${config.browse.partition || '全部'}`));

    console.log(chalk.yellow.bold('\n🎭 性格'));
    const styleNames = { friendly: '友好', professional: '专业', humorous: '幽默', concise: '简洁' };
    console.log(chalk.white(`   风格: ${styleNames[config.personality.style] || config.personality.style}`));
    console.log(chalk.white(`   使用Emoji: ${config.personality.useEmoji ? '是' : '否'}`));

    console.log(chalk.yellow.bold('\n💬 话术模板'));
    console.log(chalk.white(`   评论模板: ${config.templates.comments.length} 条`));
    config.templates.comments.forEach((t, i) => console.log(chalk.gray(`     ${i + 1}. ${t}`)));
    console.log(chalk.white(`   回复模板: ${config.templates.replies.length} 条`));
    config.templates.replies.forEach((t, i) => console.log(chalk.gray(`     ${i + 1}. ${t}`)));

    console.log(chalk.yellow.bold('\n📊 运行统计'));
    if (state.startedAt) {
      console.log(chalk.white(`   首次启动: ${new Date(state.startedAt).toLocaleString('zh-CN')}`));
    }
    console.log(chalk.white(`   已运行: ${state.rounds} 轮`));
    console.log(chalk.white(`   累计点赞: ${state.totalLikes} 次`));
    console.log(chalk.white(`   累计评论: ${state.totalComments} 次`));
    console.log(chalk.white(`   累计回复: ${state.totalReplies} 次`));
    console.log(chalk.white(`   已点赞帖子: ${state.likedPosts.length} 篇`));

    if (config.lifecycle.lifespan > 0 && state.rounds >= config.lifecycle.lifespan) {
      console.log(chalk.red.bold('\n⚠️ 寿命已尽，数字生命已停止。请使用 edit 延长寿命或 reset 重置。'));
    }

    console.log();
  });

life.command('edit').description('修改 life_config.json 配置')
  .option('--name <n>', '数字生命名称')
  .option('--bio <b>', '简介/人设')
  .option('--avatar <a>', '头像URL')
  .option('--lifespan <n>', '寿命（轮数，-1=永生）')
  .option('--interval <ms>', '检查间隔（毫秒）')
  .option('--like <bool>', '是否点赞 (true/false)')
  .option('--comment <bool>', '是否评论 (true/false)')
  .option('--reply <bool>', '是否回复被@ (true/false)')
  .option('--subcomment <bool>', '是否回复子评论 (true/false)')
  .option('--scan-comments <bool>', '是否主动扫描评论中的@提及 (true/false)')
  .option('--keywords <kw>', '关注关键词（逗号分隔）')
  .option('--exclude-keywords <kw>', '避开关键词（逗号分隔）')
  .option('--like-prob <p>', '点赞概率 (0-1)')
  .option('--comment-prob <p>', '评论概率 (0-1)')
  .option('--reply-prob <p>', '回复概率 (0-1)')
  .option('--max-likes <n>', '每轮最多点赞数')
  .option('--max-comments <n>', '每轮最多评论数')
  .option('--max-replies <n>', '每轮最多回复数')
  .option('--browse-limit <n>', '每批浏览帖子数')
  .option('--sort <s>', '排序方式 (home/rating/history/save)')
  .option('--partition <p>', '分区')
  .option('--style <s>', '性格风格 (friendly/professional/humorous/conCise)')
  .option('--emoji <bool>', '是否使用Emoji (true/false)')
  .option('--reset', '重置为默认配置')
  .action(async (options) => {
    if (options.reset) {
      saveLifeConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
      console.log(chalk.green('✅ 配置已重置为默认值！'));
      return;
    }

    const config = loadLifeConfig();
    let changed = false;

    const setIf = (path, value) => {
      if (value !== undefined && value !== null) {
        const keys = path.split('.');
        let obj = config;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        return true;
      }
      return false;
    };

    const setBool = (path, value) => {
      if (value !== undefined) {
        const keys = path.split('.');
        let obj = config;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value === 'true' || value === true;
        return true;
      }
      return false;
    };

    const setNum = (path, value) => {
      if (value !== undefined) {
        const keys = path.split('.');
        let obj = config;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = Number(value);
        return true;
      }
      return false;
    };

    changed |= setIf('identity.name', options.name);
    changed |= setIf('identity.bio', options.bio);
    changed |= setIf('identity.avatar', options.avatar);
    changed |= setNum('lifecycle.lifespan', options.lifespan);
    changed |= setNum('lifecycle.interval', options.interval);
    changed |= setBool('permissions.like', options.like);
    changed |= setBool('permissions.comment', options.comment);
    changed |= setBool('permissions.reply', options.reply);
    changed |= setBool('permissions.subcomment', options.subcomment);
    changed |= setBool('permissions.scanComments', options.scanComments);
    changed |= setNum('probabilities.like', options.likeProb);
    changed |= setNum('probabilities.comment', options.commentProb);
    changed |= setNum('probabilities.reply', options.replyProb);
    changed |= setNum('throttle.maxLikesPerRound', options.maxLikes);
    changed |= setNum('throttle.maxCommentsPerRound', options.maxComments);
    changed |= setNum('throttle.maxRepliesPerRound', options.maxReplies);
    changed |= setNum('browse.limit', options.browseLimit);
    changed |= setIf('browse.sort', options.sort);
    changed |= setIf('browse.partition', options.partition);
    changed |= setIf('personality.style', options.style);
    changed |= setBool('personality.useEmoji', options.emoji);

    if (options.keywords !== undefined) {
      config.keywords.include = options.keywords.split(',').map(k => k.trim()).filter(Boolean);
      changed = true;
    }
    if (options.excludeKeywords !== undefined) {
      config.keywords.exclude = options.excludeKeywords.split(',').map(k => k.trim()).filter(Boolean);
      changed = true;
    }

    if (!changed) {
      console.log(chalk.yellow('⚠️ 未提供任何修改参数。使用 --help 查看可用选项。'));
      return;
    }

    saveLifeConfig(config);
    console.log(chalk.green('✅ 配置已更新！使用 ssecli life status 查看。'));
  });

life.command('reset-state').description('重置运行状态（不清除配置）')
  .action(() => {
    const fresh = { rounds: 0, likedPosts: [], repliedComments: [], lastNoticeId: 0, totalLikes: 0, totalComments: 0, totalReplies: 0, startedAt: null };
    saveLifeState(fresh);
    console.log(chalk.green('✅ 运行状态已重置！'));
  });

module.exports = life;