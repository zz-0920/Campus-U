import styles from './index.module.less'
import { Button, Input, Form } from 'react-vant'
import logo from '@/assets/logo.png'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '@/api/axios.js'
import { useState } from 'react'

export default function () {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { state } = useLocation()
    
    if (state) {
        form.setFieldsValue(state)
    }

    const onFinish = async (values) => {
        setLoading(true)
        try {
            const res = await axios.post('/user/login', values)
            localStorage.setItem('userInfo', JSON.stringify(res.data))
            localStorage.setItem('accessToken', res.accessToken)
            localStorage.setItem('refreshToken', res.refreshToken)
            setTimeout(() => {
                navigate('/home')
            }, 1500)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.backgroundDecoration}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>
            
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <img src={logo} alt="Logo" className={styles.logo} />
                    </div>
                    <h1 className={styles.title}>欢迎回来</h1>
                    <p className={styles.subtitle}>登录您的账户继续使用</p>
                </div>

                <Form
                    form={form}
                    onFinish={onFinish}
                    className={styles.form}
                >
                    <Form.Item
                        rules={[{ required: true, message: '请填写用户名' }]}
                        name='username'
                        className={styles.formItem}
                    >
                        <Input 
                            placeholder='请输入用户名' 
                            className={styles.input}
                            prefix={<span className={styles.inputIcon}>👤</span>}
                        />
                    </Form.Item>
                    
                    <Form.Item
                        rules={[{ required: true, message: '请填写密码' }]}
                        name='password'
                        className={styles.formItem}
                    >
                        <Input 
                            type="password"
                            placeholder='请输入密码' 
                            className={styles.input}
                            prefix={<span className={styles.inputIcon}>🔒</span>}
                        />
                    </Form.Item>

                    <Button 
                        round 
                        nativeType='submit' 
                        type='primary' 
                        block 
                        loading={loading}
                        className={styles.submitButton}
                    >
                        {loading ? '登录中...' : '立即登录'}
                    </Button>
                </Form>

                <div className={styles.footer}>
                    <p className={styles.registerTip}>
                        还没有账号？
                        <span 
                            className={styles.registerLink} 
                            onClick={() => navigate('/register')}
                        >
                            立即注册
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}
