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


module.exports = {
    allServices,
    userLogin,
    userRegister,
    getPostList,

};