const path = require('path');
const fs = require('fs');

// 默认头像列表
const defaultAvatars = [
    'http://localhost:3000/images/avatars/avatar1.png',
    'http://localhost:3000/images/avatars/avatar2.png',
    'http://localhost:3000/images/avatars/avatar3.png',
    'http://localhost:3000/images/avatars/avatar4.png',
    'http://localhost:3000/images/avatars/avatar5.png',
    'http://localhost:3000/images/avatars/avatar6.png',
    'http://localhost:3000/images/avatars/avatar7.png',
    'http://localhost:3000/images/avatars/avatar8.png',
    'http://localhost:3000/images/avatars/avatar9.png',
    'http://localhost:3000/images/avatars/avatar10.png',
    'http://localhost:3000/images/avatars/avatar11.png',
    'http://localhost:3000/images/avatars/avatar12.png',
    'http://localhost:3000/images/avatars/avatar13.png',
    'http://localhost:3000/images/avatars/avatar14.png',
    'http://localhost:3000/images/avatars/avatar15.png',
    'http://localhost:3000/images/avatars/avatar16.png',
    'http://localhost:3000/images/avatars/avatar17.png',
    'http://localhost:3000/images/avatars/avatar18.png'
];

// 随机获取一个默认头像
const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
    return defaultAvatars[randomIndex];
};

// 获取所有默认头像
const getAllDefaultAvatars = () => {
    return defaultAvatars;
};

// 检查头像文件是否存在
const checkAvatarExists = (avatarPath) => {
    const fullPath = path.join(__dirname, '../public', avatarPath);
    return fs.existsSync(fullPath);
};

module.exports = {
    getRandomAvatar,
    getAllDefaultAvatars,
    checkAvatarExists
};