import axios from './axios';

// 更新用户信息
export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put('/user/update', userData);
    return response;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
};

// 获取用户信息
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`/user/profile/${userId}`);
    return response;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};