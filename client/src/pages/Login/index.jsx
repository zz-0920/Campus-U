import { Form, Input, Button } from 'react-vant'
import styles from './index.module.less'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (values) => {
        setLoading(true)
        try {
            const result = await login(values.email, values.password)
            if (result.success) {
                // 登录成功后跳转到之前访问的页面或首页
                const from = location.state?.from?.pathname || '/home'
                navigate(from, { replace: true })
            }
        } catch (error) {
            console.log(error)
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
                        <div className={styles.logo}>校园交友</div>
                    </div>
                    <h1 className={styles.title}>欢迎回来</h1>
                    <p className={styles.subtitle}>登录您的账户继续使用</p>
                </div>

                <Form
                    form={form}
                    onFinish={handleLogin}
                    className={styles.form}
                    footer={
                        <div>
                            <Button
                                type='primary'
                                block
                                size='large'
                                className={styles.submitButton}
                                loading={loading}
                            >
                                登录
                            </Button>
                        </div>
                    }
                >
                <Form.Item
                    rules={[{ required: true, message: '请填写邮箱' }]}
                    name='email'
                    className={styles.formItem}
                >
                    <Input
                        placeholder='请输入邮箱'
                        className={styles.input}
                        prefix={<span className={styles.inputIcon}>📧</span>}
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

                {/* <Button
                    type='primary'
                    block
                    size='large'
                    className={styles.submitButton}
                    loading={loading}
                >
                    登录
                </Button> */}
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
        </div >
    )
}
