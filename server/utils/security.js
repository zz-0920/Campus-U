const bcrypt = require('bcrypt');

// 转义特殊字符
function escape(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

// 加密密码
const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('密码加密失败: ' + error.message);
    }
};

// 验证密码
const comparePassword = async (password, hashedPassword) => {
    try {
        const isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
    } catch (error) {
        throw new Error('密码验证失败: ' + error.message);
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    escape
};
