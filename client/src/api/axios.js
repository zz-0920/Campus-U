import axios from 'axios'
import toast from 'react-hot-toast';

axios.defaults.baseURL = 'http://localhost:3000'
// 告诉浏览器，如果发送的是 post 请求，那么后端一定会返回 json 数据，让浏览器以解析 json 的方式解析响应体
axios.defaults.headers.post['Content-Type'] = 'application/json'

// 响应拦截器
axios.interceptors.response.use(
    (response) => {
        // console.log(response);
        // 响应成功，返回响应体
        if (response.data.code === '1') {
            toast.success(response.data.msg);
            return Promise.resolve(response.data)
        } else {
            toast.error(response.data.msg);
            return Promise.reject(response.data)
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 请求拦截器
axios.interceptors.request.use(
    (request) => {
        // 从 localStorage 中获取 token
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            // 如果有 token，添加到请求头
            request.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return request
    }
)

export default axios