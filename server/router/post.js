const Router = require('@koa/router');
const router = new Router();
const { getPostList, getPostDetail } = require('../controllers/index.js');

const { verify } = require('../utils/jwt.js');

router.prefix('/post')

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

router.get('/detail/:id', verify(), async (ctx) => {
    try {
        // console.log(ctx)
        const { id } = ctx.params;
        const res = await getPostDetail(id, ctx.userId);
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