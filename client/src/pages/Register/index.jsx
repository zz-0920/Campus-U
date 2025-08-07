import { Form, Input, Button } from 'react-vant'
import styles from './index.module.less'
import logo from '@/assets/logo.png'
import { useNavigate } from 'react-router-dom'
import axios from '@/api/axios.js'
import { useState } from 'react'

export default function Register() {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    
    const onFinish = async (values) => {
        setLoading(true)
        try {
            const res = await axios.post('/user/register', values)
            if (res.code === '1') {
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            username: values.username,
                            password: values.password
                        }
                    })
                }, 1500)
            } else {
                console.error(res.msg)
            }
        } catch (err) {
            console.error(err)
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
            
            <div className={styles.registerCard}>
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <img src={logo} alt="Logo" className={styles.logo} />
                    </div>
                    <h1 className={styles.title}>创建账户</h1>
                    <p className={styles.subtitle}>加入我们的校园U+，开启新的校园生活</p>

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
                    
                    <Form.Item
                        rules={[{ required: true, message: '请填写昵称' }]}
                        name='nickname'
                        className={styles.formItem}
                    >
                        <Input 
                            placeholder='请输入昵称' 
                            className={styles.input}
                            prefix={<span className={styles.inputIcon}>✨</span>}
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
                        {loading ? '注册中...' : '立即注册'}
                    </Button>
                </Form>

                <div className={styles.footer}>
                    <p className={styles.loginTip}>
                        已有账号？
                        <span 
                            className={styles.loginLink} 
                            onClick={() => navigate('/login')}
                        >
                            立即登录
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}