const path = require('path');
const fs = require('fs');

// 默认头像列表
const defaultAvatars = [
    '/images/avatars/avatar1.png',
    '/images/avatars/avatar2.png',
    '/images/avatars/avatar3.png',
    '/images/avatars/avatar4.png',
    '/images/avatars/avatar5.png',
    '/images/avatars/avatar6.png',
    '/images/avatars/avatar7.png',
    '/images/avatars/avatar8.png',
    '/images/avatars/avatar9.png',
    '/images/avatars/avatar10.png',
    '/images/avatars/avatar11.png',
    '/images/avatars/avatar12.png',
    '/images/avatars/avatar13.png',
    '/images/avatars/avatar14.png',
    '/images/avatars/avatar15.png',
    '/images/avatars/avatar16.png',
    '/images/avatars/avatar17.png',
    '/images/avatars/avatar18.png'
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