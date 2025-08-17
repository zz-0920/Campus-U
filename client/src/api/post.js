import axios from './axios';

// 获取帖子列表
export const getPostList = () => {
  return axios.get('/post/list');
};

// 获取帖子详情
export const getPostDetail = (id) => {
  return axios.get(`/post/detail/${id}`);
};

// 发布帖子
export const publishPost = (data) => {
  return axios.post('/post/publish', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 点赞帖子
export const likePost = (postId) => {
  return axios.post('/post/like', { postId });
};

// 取消点赞
export const unlikePost = (postId) => {
  return axios.post('/post/unlike', { postId });
};

// 删除帖子
export const deletePost = (postId) => {
  return axios.delete(`/post/${postId}`);
};

// 举报帖子
export const reportPost = (postId, reason) => {
  return axios.post('/post/report', { postId, reason });
};