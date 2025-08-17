const Router = require('@koa/router');
const router = new Router();
const {
    getChatList,
    getChatMessages,
    sendMessage,
    markMessagesAsRead
} = require('../controllers/index.js');
const { verify } = require('../utils/jwt.js');

router.prefix('/message')

// 获取聊天列表
router.get('/list', verify(), async (ctx) => {
    try {
        const userId = ctx.userId;
        const res = await getChatList(userId);
        
        ctx.body = {
            code: '1',
            msg: '获取成功',
            data: res
        }
    } catch (error) {
        console.error('获取聊天列表失败:', error);
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: []
        }
    }
})

// 获取与特定用户的聊天记录
router.get('/chat/:userId', verify(), async (ctx) => {
    try {
        const currentUserId = ctx.userId; // 当前用户ID
        const { userId } = ctx.params; // 聊天对象用户ID
        
        const res = await getChatMessages(currentUserId, parseInt(userId));
        
        // 标记消息为已读
        await markMessagesAsRead(currentUserId, parseInt(userId));
        
        ctx.body = {
            code: '1',
            msg: '获取成功',
            data: res
        }
    } catch (error) {
        console.error('获取聊天记录失败:', error);
        ctx.body = {
            code: '0',
            msg: '获取失败',
            data: []
        }
    }
})

// 发送消息
router.post('/send', verify(), async (ctx) => {
    try {
        const senderId = ctx.userId; // 发送者ID
        const { receiverId, content, messageType = 'text' } = ctx.request.body;
        
        if (!receiverId || !content) {
            ctx.body = {
                code: '0',
                msg: '接收者ID和消息内容不能为空',
                data: {}
            }
            return;
        }
        
        const newMessage = await sendMessage(senderId, receiverId, content, messageType);
        
        ctx.body = {
            code: '1',
            msg: '发送成功',
            data: newMessage
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        ctx.body = {
            code: '0',
            msg: '发送失败',
            data: {}
        }
    }
})

// 标记消息为已读
router.post('/read', verify(), async (ctx) => {
    try {
        const userId = ctx.userId; // 当前用户ID
        const { chatUserId } = ctx.request.body; // 聊天对象用户ID
        
        if (!chatUserId) {
            ctx.body = {
                code: '0',
                msg: '聊天对象用户ID不能为空',
                data: {}
            }
            return;
        }
        
        await markMessagesAsRead(userId, chatUserId);
        
        ctx.body = {
            code: '1',
            msg: '标记成功',
            data: {}
        }
    } catch (error) {
        console.error('标记消息已读失败:', error);
        ctx.body = {
            code: '0',
            msg: '标记失败',
            data: {}
        }
    }
})

module.exports = router;