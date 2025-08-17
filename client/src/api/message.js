import axios from './axios';

// 获取聊天列表
export const getChatList = () => {
  return axios.get('/message/list');
};

// 获取与特定用户的聊天记录
export const getChatMessages = (userId) => {
  return axios.get(`/message/chat/${userId}`);
};

// 发送消息
export const sendMessage = (data) => {
  return axios.post('/message/send', data);
};

// 标记消息为已读
export const markMessagesAsRead = (data) => {
  return axios.post('/message/read', data);
};