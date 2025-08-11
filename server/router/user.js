const Router = require('@koa/router');
const router = new Router();
const { userLogin, userRegister } = require('../controllers/index.js');
const { sign, verify } = require('../utils/jwt.js');
const { escape } = require('../utils/security.js');
const jwt = require('jsonwebtoken');


router.prefix('/user');

router.post('/login', async (ctx) => {
    try {
        let { username, password } = ctx.request.body;

        // 输入验证
        if (!username || !password) {
            ctx.body = {
                code: '0',
                msg: '用户名和密码不能为空',
                data: {}
            };
            return;
        }

        // 转义特殊字符，与注册时保持一致
        username = escape(username);
        password = escape(password);

        const result = await userLogin(username, password);

        if (result.success) {
            // 登录成功处理
            const user = result.user;
            let data = {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                create_time: user.create_time,
                avatar: user.avatar,
            };

            const accessToken = sign(data, '1h');
            const refreshToken = sign(data, '7d');
            console.log(accessToken, refreshToken);
            ctx.body = {
                code: '1',
                msg: '登录成功',
                data: data,
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        } else {
            // 业务逻辑错误（用户不存在、密码错误等）
            ctx.body = {
                code: '0',
                msg: result.message || '登录失败',
                errorType: result.errorType,
                data: {}
            };
        }
    } catch (error) {
        // 系统级错误（数据库连接、服务器异常等）
        console.error('系统级登录错误:', error);

        let errorMsg = '服务器异常';
        let errorType = 'SYSTEM_ERROR';

        if (error.type === 'DATABASE_CONNECTION_ERROR') {
            errorMsg = '服务暂时不可用，请稍后重试';
            errorType = 'DATABASE_CONNECTION_ERROR';
        } else if (error.type === 'DATABASE_QUERY_ERROR') {
            errorMsg = '数据处理异常';
            errorType = 'DATABASE_QUERY_ERROR';
        }

        ctx.body = {
            code: '-1',
            msg: errorMsg,
            errorType: errorType,
            data: {}
        };
    }
});

router.post('/register', async (ctx) => {
    try {
        let { username, password, nickname } = ctx.request.body

        // 输入验证
        if (!username || !password || !nickname) {
            ctx.body = {
                code: '0',
                msg: '用户名和密码不能为空',
                data: {}
            };
            return;
        }

        // 转义特殊字符
        username = escape(username);
        password = escape(password);
        nickname = escape(nickname);

        const result = await userRegister(username, password, nickname);
        if (result.success) {
            ctx.body = {
                code: '1',
                msg: '注册成功',
                data: {}
            };
        } else {
            ctx.body = {
                code: '0',
                msg: result.message || '注册失败',
                data: {}
            };
        }
    } catch (error) {
        console.error('注册错误:', error);
        ctx.body = {
            code: '-1',
            msg: '服务器异常',
            data: {}
        };
    }
})

router.post('/refresh', async (ctx) => {
    try {
        const { refreshToken } = ctx.request.body;
        if (!refreshToken) {
            ctx.status = 401
            ctx.body = {
                code: '0',
                msg: '刷新令牌不能为空',
                data: {}
            };
            return;
        }

        const decoded = jwt.verify(refreshToken, 'zz是个大帅哥');

        const newAccessToken = sign(
            {
                id: decoded.id,
                username: decoded.username,
                nickname: decoded.nickname,
                create_time: decoded.create_time,
                avatar: decoded.avatar,
            }, '1h');

        const newRefreshToken = sign(
            {
                id: decoded.id,
                username: decoded.username,
                nickname: decoded.nickname,
                create_time: decoded.create_time,
                avatar: decoded.avatar,
            }, '7d');

        ctx.body = {
            code: '1',
            msg: '刷新成功',
            data: {},
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }


    } catch (error) {
        ctx.status = 401;
        ctx.body = {
            code: '0',
            msg: '刷新令牌过期',
            data: {}
        }
    }

})

module.exports = router;