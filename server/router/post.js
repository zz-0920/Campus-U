const Router = require('@koa/router');
const router = new Router();
const { getPostList, getPostDetail, getPostLikesInfo, getPostComments, togglePostLike } = require('../controllers/index.js');



const { verify } = require('../utils/jwt.js');

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


module.exports = router;