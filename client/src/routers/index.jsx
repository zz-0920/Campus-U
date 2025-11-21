import { BrowserRouter, Navigate, useRoutes } from 'react-router-dom'
import React, { Suspense } from 'react'

const Login = React.lazy(() => import('@/pages/Login/index.jsx'))
const Home = React.lazy(() => import('@/pages/Home/index.jsx'))
const Register = React.lazy(() => import('@/pages/Register/index.jsx'))
const PostDetail = React.lazy(() => import('@/pages/PostDetail/index.jsx'))
const Discover = React.lazy(() => import('@/pages/Discover/index.jsx'))
const Message = React.lazy(() => import('@/pages/Message/index.jsx'))
const MessageDetail = React.lazy(() => import('@/pages/MessageDetail/index.jsx'))
const Publish = React.lazy(() => import('@/pages/Publish/index.jsx'))
const Profile = React.lazy(() => import('@/pages/Profile/index.jsx'))
const EditProfile = React.lazy(() => import('@/pages/EditProfile/index.jsx'))
const MyPosts = React.lazy(() => import('@/pages/MyPosts/index.jsx'))
const MyFavorites = React.lazy(() => import('@/pages/MyFavorites/index.jsx'))
const Setting = React.lazy(() => import('@/pages/Setting/index.jsx'))


const Routers = [
    {
        path: '/',
        element: <Navigate to='/home' />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/home',
        element: <Home />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/post/detail/:id',
        element: <PostDetail />
    },
    {
        path: '/discover',
        element: <Discover />
    },
    {
        path: '/message',
        element: <Message />
    },
    {
        path: '/message/:userId',
        element: <MessageDetail />
    },
    {
        path: '/publish',
        element: <Publish />
    },
    {
        path: '/profile/:id',
        element: <Profile />
    },
    {
        path: '/edit-profile',
        element: <EditProfile />
    },
    {
        path: '/my-posts/:userId',
        element: <MyPosts />
    },
    {
        path: '/my-favorites',
        element: <MyFavorites />
    },
    {
        path: '/setting',
        element: <Setting />
    }
]

// 内部路由组件
function AppRoutes() {
    // useRoutes 这个 Hook 函数只能用在路由组件中，也就是说，该组件不能被抛出
    return useRoutes(Routers)
}

// 外层包装组件
export default function WrapperRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>加载中...</div>}>
                <AppRoutes />
            </Suspense>
        </BrowserRouter>
    )
}
