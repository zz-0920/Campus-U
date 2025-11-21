const Router = require('@koa/router');
const router = new Router();
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');
const {
    getPostList,
    getPostDetail,
    getPostLikesInfo,
    getPostComments,
    togglePostLike,
    addComment,
    publishPost,
    getUserPosts,
    getUserFavorites
} = require('../controllers/index.js');
const { verify } = require('../utils/jwt.js');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads');
        // 确保上传目录存在
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'post-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('只支持 JPG、PNG、GIF 格式的图片'));
        }
    }
});

router.prefix('/post')

// 获取帖子列表
router.get('/list', verify(), async (ctx) => {
    try {
        const res = await getPostList();
        // console.log(res)

        ctx.body = {
            code: '1',
            msg: '获取成功',
            data: res
        }
    } catch (error) {
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: {}
        }
    }
})

// 获取帖子详情
router.get('/detail/:id', verify(), async (ctx) => {
    try {
        // console.log(ctx)
        const { id } = ctx.params;
        const res = await getPostDetail(id, ctx.userId);
        // console.log(res)
        ctx.body = {
            code: '1',
            msg: '获取成功',
            data: res
        }
    } catch (error) {
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: {}
        }
    }
})

// 获取点赞数
router.get('/likes/:id', verify(), async (ctx) => {
    try {
        const { id } = ctx.params;
        const userId = ctx.userId; // 从JWT中获取用户ID
        const res = await getPostLikesInfo(id, userId);
        ctx.body = {
            code: '1',
            msg: '获取成功',
            data: res
        }
    } catch (error) {
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: {}
        }
    }
})

// 点赞或取消点赞
router.post('/likes', verify(), async (ctx) => {
    try {
        const { post_id, user_id } = ctx.request.body;
        const res = await togglePostLike(post_id, user_id);
        if (res.success) {
            ctx.body = {
                code: '1',
                msg: res.action === 'liked' ? '点赞成功' : '取消点赞成功',
                data: { action: res.action }
            }
        } else {
            ctx.body = {
                code: '0',
                msg: '操作失败',
                data: {}
            }
        }
    } catch (error) {
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: {}
        }
    }
})

// 获取评论
router.get('/comments/:id', verify(), async (ctx) => {
    try {
        const { id } = ctx.params;
        const res = await getPostComments(id);
        console.log(res)
        ctx.body = {
            code: '1',
            msg: '获取成功',
            data: res
        }
    } catch (error) {
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: {}
        }
    }
})

// 评论
router.post('/comments', verify(), async (ctx) => {
    try {
        const { postId, content } = ctx.request.body;
        const userId = ctx.userId; // 从JWT中间件获取用户ID

        const newComment = await addComment(postId, userId, content);

        ctx.body = {
            code: '1',
            msg: '评论成功',
            data: newComment
        };
    } catch (error) {
        console.error('评论失败:', error);
        ctx.status = 500;
        ctx.body = {
            code: '0',
            msg: '评论失败',
            error: error.message
        };
    }
});

// 发布帖子
router.post('/publish', verify(), upload.single('image'), async (ctx) => {
    try {
        const { content } = ctx.request.body;
        const userId = ctx.userId;
        
        // 验证内容
        if (!content || !content.trim()) {
            ctx.status = 400;
            ctx.body = {
                code: '0',
                msg: '发布内容不能为空',
                data: {}
            };
            return;
        }
        
        if (content.trim().length < 5) {
            ctx.status = 400;
            ctx.body = {
                code: '0',
                msg: '发布内容至少需要5个字符',
                data: {}
            };
            return;
        }
        
        if (content.trim().length > 500) {
            ctx.status = 400;
            ctx.body = {
                code: '0',
                msg: '发布内容不能超过500个字符',
                data: {}
            };
            return;
        }
        
        // 处理图片URL
        let imageUrl = null;
        if (ctx.file) {
            imageUrl = `/uploads/${ctx.file.filename}`;
        }
        
        // 获取位置信息（可选）
        const { location = '' } = ctx.request.body;
        
        const result = await publishPost(userId, content.trim(), imageUrl, location);
        
        if (result.success) {
            ctx.body = {
                code: '1',
                msg: '发布成功',
                data: result.post
            };
        } else {
            ctx.status = 500;
            ctx.body = {
                code: '0',
                msg: '发布失败',
                data: {}
            };
        }
    } catch (error) {
        console.error('发布帖子错误:', error);
        
        // 如果是文件上传错误
        if (error.message.includes('只支持')) {
            ctx.status = 400;
            ctx.body = {
                code: '0',
                msg: error.message,
                data: {}
            };
            return;
        }
        
        ctx.status = 500;
        ctx.body = {
            code: '0',
            msg: '服务器错误，请稍后重试',
            data: {}
        };
    }
});

// 获取用户的帖子
router.get('/user/:userId', verify(), async (ctx) => {
    try {
        const { userId } = ctx.params;
        const posts = await getUserPosts(userId);
        ctx.body = {
            code: '1',
            msg: '获取用户帖子成功',
            data: posts
        };
    } catch (error) {
        console.error('获取用户帖子失败:', error);
        ctx.body = {
            code: '0',
            msg: '获取用户帖子失败',
            data: []
        };
    }
});

// 获取用户收藏的帖子
router.get('/favorites', verify(), async (ctx) => {
    try {
        const userId = ctx.userId; // 从JWT中间件获取用户ID
        
        const favorites = await getUserFavorites(userId);
        ctx.body = {
            code: '1',
            msg: '获取用户点赞成功',
            data: favorites
        };
    } catch (error) {
        console.error('获取用户点赞失败:', error);
        ctx.body = {
            code: '0',
            msg: '获取用户点赞失败',
            data: []
        };
    }
});

module.exports = router;