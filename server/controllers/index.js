// 数据库相关操作
const mysql = require('mysql2/promise');
const config = require('../config/index.js');
const { comparePassword, hashPassword } = require('../utils/security');
const { getRandomAvatar } = require('../utils/avatar');

// 数据库连接池
const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
});

// 执行 sql 的方法
const allServices = {
    query: async (sql, values) => {
        try {
            const [rows] = await pool.execute(sql, values);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
}

// 登录
const userLogin = async (username, password) => {
    try {
        // ✅ 使用参数化查询防止SQL注入
        const _sql = `select * from users where username=?`;
        const users = await allServices.query(_sql, [username]);

        if (users.length === 0) {
            return { success: false, errorType: 'USER_NOT_FOUND', message: '用户不存在' };
        }

        const user = users[0];
        const isValid = await comparePassword(password, user.password_hash);


        if (isValid) {
            return { success: true, user: user };
        } else {
            return { success: false, errorType: 'WRONG_PASSWORD', message: '账号或密码错误' };
        }
    } catch (error) {
        console.error('登录错误详情:', error);
        
        // 根据错误类型决定是否重新抛出
        if (error.code === 'ECONNREFUSED' || 
            error.code === 'ENOTFOUND' || 
            error.code === 'ETIMEDOUT') {
            // 数据库连接相关错误，抛出给上层处理
            throw { 
                type: 'DATABASE_CONNECTION_ERROR', 
                originalError: error,
                message: '数据库连接失败'
            };
        } else {
            // 其他数据库错误（如SQL语法错误），也抛出给上层
            throw {
                type: 'DATABASE_QUERY_ERROR',
                originalError: error,
                message: '数据库查询错误'
            };
        }
    }
};

// 注册
const userRegister = async (username, password, nickname) => {
    try {
        // 检查用户名是否已存在
        const checkUser = 'select * from users where username=?'
        const user = await allServices.query(checkUser, [username])
        if (user.length > 0) {
            return { success: false, message: '用户名已存在' };
        }

        // 密码加密
        const hashedPassword = await hashPassword(password);

        // 随机获取一个默认头像
        const avatar = getRandomAvatar();

        const registerUser = 'insert into users (username, password_hash, nickname, avatar) values (?, ?, ?, ?)'
        const result = await allServices.query(registerUser, [username, hashedPassword, nickname, avatar]);
        if (result.affectedRows > 0) {
            return { success: true, message: '注册成功' };
        } else {
            return { success: false, message: '注册失败' };
        }
    } catch (error) {
        console.error('注册错误详情:');
        console.error('错误类型:', error.constructor.name);
        console.error('错误代码:', error.code);
        console.error('错误消息:', error.message);
        console.error('完整错误:', error);
        return { success: false, message: '注册失败' + error.message };
    }
}

// 获取帖子列表
const getPostList = async () => {
    try {
        const sql = `
            SELECT 
                p.*,
                u.avatar,
                u.nickname,
                u.username
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.visibility = 'public'
            ORDER BY p.created_at DESC

        `;
        const res = await allServices.query(sql);
        return res;
    } catch (error) {
        console.error('获取帖子列表错误详情:', error);
        throw error;
    }
}

// 获取帖子详情
const getPostDetail = async (id, userId) => {
    try {
        const sql = `
            SELECT 
                p.*,
                u.avatar,
                u.nickname,
                u.username
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ? AND p.visibility = 'public'
        `;
        const res = await allServices.query(sql, [id]);
        
        if (res.length === 0) {
            return null; // 帖子不存在或不可见
        }
        
        return res[0]; // 返回单个帖子详情
    } catch (error) {
        console.error('获取帖子详情错误:', error);
        throw error;
    }
}

// 获取帖子点赞信息
const getPostLikesInfo = async (post_id, user_id = null) => {
    try {
        // 获取点赞总数
        const countSql = `
            SELECT COUNT(*) as like_count
            FROM likes
            WHERE post_id = ?
        `;
        const countRes = await allServices.query(countSql, [post_id]);
        const like_count = countRes[0].like_count;
        
        let isLiked = false;
        if (user_id) {
            // 检查用户是否已点赞
            const checkSql = `
                SELECT COUNT(*) as like_exists
                FROM likes
                WHERE post_id = ? AND user_id = ?
            `;
            const checkRes = await allServices.query(checkSql, [post_id, user_id]);
            isLiked = checkRes[0].like_exists > 0;
        }
        
        return {
            like_count,
            isLiked
        };
    } catch (error) {
        console.error('获取帖子点赞信息错误:', error);
        throw error;
    }
}

// 点赞/取消点赞帖子
const togglePostLike = async (post_id, user_id) => {
    try {
        // 先检查当前点赞状态
        const checkSql = `
            SELECT COUNT(*) as like_exists
            FROM likes
            WHERE post_id = ? AND user_id = ?
        `;
        const checkRes = await allServices.query(checkSql, [post_id, user_id]);
        const isLiked = checkRes[0].like_exists > 0;
        
        if (isLiked) {
            // 如果已点赞，则取消点赞
            const sql = `
                DELETE FROM likes
                WHERE post_id = ? AND user_id = ?
            `;
            const res = await allServices.query(sql, [post_id, user_id]);
            return { success: res.affectedRows > 0, action: 'unliked' };
        } else {
            // 如果未点赞，则添加点赞
            const sql = `
                INSERT INTO likes (post_id, user_id, created_at)
                VALUES (?, ?, NOW())
            `;
            const res = await allServices.query(sql, [post_id, user_id]);
            return { success: res.affectedRows > 0, action: 'liked' };
        }
    } catch (error) {
        console.error('切换点赞状态错误:', error);
        throw error;
    }
}


// 获取帖子评论数和评论列表
const getPostComments = async (id) => {
    try {
        // 获取评论数量
        const countSql = `
            SELECT COUNT(*) as comment_count
            FROM comments
            WHERE post_id = ?
        `;
        const countRes = await allServices.query(countSql, [id]);
        
        // 获取评论列表（包含用户信息）
        const commentsSql = `
            SELECT 
                c.*,
                u.username,
                u.nickname,
                u.avatar
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
        `;
        const commentsRes = await allServices.query(commentsSql, [id]);
        
        return {
            comment_count: countRes[0].comment_count,
            comments: commentsRes
        };
    } catch (error) {
        console.error('获取帖子评论错误:', error);
        throw error;
    }
}

// 添加评论
const addComment = async (postId, userId, content) => {
  try {
    const sql = `
      INSERT INTO comments (post_id, user_id, content, created_at)
      VALUES (?, ?, ?, NOW())
    `
    const result = await allServices.query(sql, [postId, userId, content])
    
    // 获取刚插入的评论详情
    const commentSql = `
      SELECT 
        c.*,
        u.nickname,
        u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `
    const commentResult = await allServices.query(commentSql, [result.insertId])
    
    return commentResult[0]
  } catch (error) {
    console.error('添加评论错误:', error)
    throw error
  }
}

// 获取用户的聊天列表
const getChatList = async (userId) => {
    try {
        const sql = `
            SELECT 
                latest_messages.chat_user_id,
                latest_messages.nickname,
                latest_messages.avatar,
                latest_messages.last_message,
                latest_messages.last_message_time,
                COALESCE(unread_counts.unread_count, 0) as unread_count
            FROM (
                SELECT 
                    CASE 
                        WHEN m.sender_id = ? THEN m.receiver_id
                        ELSE m.sender_id
                    END as chat_user_id,
                    u.nickname,
                    u.avatar,
                    m.content as last_message,
                    m.created_at as last_message_time,
                    ROW_NUMBER() OVER (
                        PARTITION BY CASE 
                            WHEN m.sender_id = ? THEN m.receiver_id
                            ELSE m.sender_id
                        END 
                        ORDER BY m.created_at DESC
                    ) as rn
                FROM messages m
                LEFT JOIN users u ON (
                    CASE 
                        WHEN m.sender_id = ? THEN u.id = m.receiver_id
                        ELSE u.id = m.sender_id
                    END
                )
                WHERE m.sender_id = ? OR m.receiver_id = ?
            ) latest_messages
            LEFT JOIN (
                SELECT 
                    sender_id as chat_user_id,
                    COUNT(*) as unread_count
                FROM messages 
                WHERE receiver_id = ? AND is_read = 0
                GROUP BY sender_id
            ) unread_counts ON latest_messages.chat_user_id = unread_counts.chat_user_id
            WHERE latest_messages.rn = 1 AND latest_messages.chat_user_id IS NOT NULL
            ORDER BY latest_messages.last_message_time DESC
        `;
        const res = await allServices.query(sql, [userId, userId, userId, userId, userId, userId]);
        
        return res;
    } catch (error) {
        console.error('获取聊天列表错误:', error);
        throw error;
    }
}

// 获取两个用户之间的聊天记录
const getChatMessages = async (userId1, userId2) => {
    try {
        const sql = `
            SELECT 
                m.*,
                sender.nickname as sender_nickname,
                sender.avatar as sender_avatar,
                receiver.nickname as receiver_nickname,
                receiver.avatar as receiver_avatar
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            LEFT JOIN users receiver ON m.receiver_id = receiver.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        const res = await allServices.query(sql, [userId1, userId2, userId2, userId1]);
        return res;
    } catch (error) {
        console.error('获取聊天记录错误:', error);
        throw error;
    }
}

// 发送消息
const sendMessage = async (senderId, receiverId, content, messageType = 'text') => {
    try {
        const sql = `
            INSERT INTO messages (sender_id, receiver_id, content, message_type, is_read, created_at)
            VALUES (?, ?, ?, ?, 0, NOW())
        `;
        const result = await allServices.query(sql, [senderId, receiverId, content, messageType]);
        
        // 获取刚发送的消息详情
        const selectSql = `
            SELECT 
                m.*,
                sender.nickname as sender_nickname,
                sender.avatar as sender_avatar,
                receiver.nickname as receiver_nickname,
                receiver.avatar as receiver_avatar
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            LEFT JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.id = ?
        `;
        const newMessage = await allServices.query(selectSql, [result.insertId]);
        
        return newMessage[0];
    } catch (error) {
        console.error('发送消息错误:', error);
        throw error;
    }
}

// 标记消息为已读
const markMessagesAsRead = async (userId, chatUserId) => {
    try {
        const sql = `
            UPDATE messages 
            SET is_read = 1 
            WHERE receiver_id = ? AND sender_id = ? AND is_read = 0
        `;
        const result = await allServices.query(sql, [userId, chatUserId]);
        return result;
    } catch (error) {
        console.error('标记消息已读错误:', error);
        throw error;
    }
}

// 发布帖子
const publishPost = async (userId, content, imageUrl = null, location = '') => {
    try {
        const _sql = `INSERT INTO posts (user_id, content, image_url, location, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`;
        const result = await allServices.query(_sql, [userId, content, imageUrl, location]);
        
        // 获取刚插入的帖子详情
        const postId = result.insertId;
        const postDetail = await getPostDetail(postId, userId);
        
        return { success: true, post: postDetail };
    } catch (error) {
        console.error('发布帖子错误:', error);
        throw error;
    }
}

// 获取用户的帖子列表
const getUserPosts = async (userId) => {
    try {
        const _sql = `
            SELECT 
                p.id,
                p.content,
                p.image_url,
                p.location,
                p.created_at,
                p.updated_at,
                u.id as user_id,
                u.nickname,
                u.avatar
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `;
        const posts = await allServices.query(_sql, [userId]);
        return posts;
    } catch (error) {
        console.error('获取用户帖子错误:', error);
        throw error;
    }
};

// 获取用户收藏的帖子列表（复用likes表）
const getUserFavorites = async (userId) => {
    try {
        // 获取用户点赞的帖子作为收藏
        const _sql = `
            SELECT 
                p.id,
                p.content,
                p.image_url,
                p.location,
                p.created_at,
                p.updated_at,
                u.id as user_id,
                u.nickname,
                u.avatar,
                l.created_at as favorite_time
            FROM likes l
            LEFT JOIN posts p ON l.post_id = p.id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE l.user_id = ?
            ORDER BY l.created_at DESC
        `;
        const favorites = await allServices.query(_sql, [userId]);
        return favorites;
    } catch (error) {
        console.error('获取用户点赞错误:', error);
        throw error;
    }
};

// 更新用户资料
const userUpdateProfile = async (userId, updateData) => {
    try {
        const { escape } = require('../utils/security.js');
        
        // 构建更新SQL
        const updateFields = [];
        const updateValues = [];
        
        // 定义允许更新的字段
        const allowedFields = ['username', 'nickname', 'email', 'phone', 'gender', 'school', 'major', 'grade', 'bio', 'avatar'];
        
        // 动态构建更新字段
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(escape(updateData[field]));
            }
        });
        
        if (updateFields.length === 0) {
            return { success: false, message: '没有需要更新的字段' };
        }
        
        // 添加用户ID到参数列表
        updateValues.push(userId);
        const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        // 执行更新
        const result = await allServices.query(updateSql, updateValues);
        
        if (result.affectedRows > 0) {
            // 获取更新后的用户信息
            const getUserSql = 'SELECT id, username, nickname, email, phone, gender, school, major, grade, bio, avatar, created_at FROM users WHERE id = ?';
            const updatedUser = await allServices.query(getUserSql, [userId]);
            
            return { 
                success: true, 
                message: '更新成功',
                data: updatedUser[0]
            };
        } else {
            return { success: false, message: '更新失败，用户不存在' };
        }
    } catch (error) {
        console.error('更新用户资料错误:', error);
        return { success: false, message: '更新失败: ' + error.message };
    }
};

module.exports = {
    allServices,
    query: allServices.query,
    userLogin,
    userRegister,
    userUpdateProfile,
    getPostList,
    getPostDetail,
    getPostLikesInfo,
    getPostComments,
    togglePostLike,
    addComment,
    getChatList,
    getChatMessages,
    sendMessage,
    markMessagesAsRead,
    publishPost,
    getUserPosts,
    getUserFavorites,
};