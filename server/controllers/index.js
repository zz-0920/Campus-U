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

module.exports = {
    allServices,
    userLogin,
    userRegister,
    getPostList,
    getPostDetail,
    getPostLikesInfo,
    getPostComments,
    togglePostLike,
    addComment,

};