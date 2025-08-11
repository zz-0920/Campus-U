import axios from 'axios'
import { Toast } from 'react-vant';


axios.defaults.baseURL = 'http://localhost:3000'
// 告诉浏览器，如果发送的是 post 请求，那么后端一定会返回 json 数据，让浏览器以解析 json 的方式解析响应体
axios.defaults.headers.post['Content-Type'] = 'application/json'

// 响应拦截器
axios.interceptors.response.use(
    (response) => {
        // console.log(response);
        // 响应成功，返回响应体
        if (response.data.code === '1') {
            Toast.success(response.data.msg);
            return Promise.resolve(response.data)
        } else {
            Toast.fail(response.data.msg);
            return Promise.reject(response.data)
        }
    },
    async (error) => {
        console.log(error)
        if (error.isBusinessError) {
            return Promise.reject(error)
        }
        if (error.response) {
            const { status, data, config } = error.response
            switch (status) {
                case 401:
                    const refreshToken = localStorage.getItem('refreshToken')
                    if (refreshToken && !config._retry) {
                        config._retry = true
                        try {
                            // 刷新令牌
                            const res = await axios.post('/user/refresh', { refreshToken })

                            localStorage.setItem('accessToken', res.accessToken)
                            localStorage.setItem('refreshToken', res.refreshToken)

                            // 确保headers对象存在
                            if (!config.headers) {
                                config.headers = {}
                            }
                            
                            // 重新发送原始请求
                            config.headers['Authorization'] = `Bearer ${res.accessToken}`
                            return axios.request(config)

                        } catch (refreshError) {
                            // refreshToken也过期了，跳转登录页
                            Toast.fail('登录已过期，请重新登录')
                            localStorage.removeItem('accessToken')
                            localStorage.removeItem('refreshToken')
                            localStorage.removeItem('userInfo')
                            setTimeout(() => {
                                window.location.href = '/login'
                            }, 1500)
                            return Promise.reject(refreshError)
                        }
                    } else {
                        // 没有refreshToken或已经重试过，直接跳转登录页
                        Toast.fail('登录已过期，请重新登录')
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken')
                        localStorage.removeItem('userInfo')
                        setTimeout(() => {
                            console.log('跳转登录页2')

                            window.location.href = '/login'
                        }, 200000)
                    }
                    break
            }
        }
    }
)

// 请求拦截器
axios.interceptors.request.use(
    (request) => {
        // 从 localStorage 中获取 token
        const accessToken = localStorage.getItem('accessToken')
        // console.log(accessToken)
        if (accessToken) {
            // 如果有 token，添加到请求头
            request.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return request
    }
)

export default axios