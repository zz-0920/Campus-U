import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@react-vant/icons';
import { Form, Field, Button, Toast, Picker, Input } from 'react-vant';
import { updateUserProfile } from '../../api/user';
import styles from './index.module.less';

export default function EditProfile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [avatar, setAvatar] = useState([]);
  const [showGenderPicker, setShowGenderPicker] = useState(false);


  // 性别选项
  const genderOptions = [
    { text: '男', value: '男' },
    { text: '女', value: '女' },
    { text: '保密', value: '保密' }
  ];

  // 获取当前用户信息
  useEffect(() => {
    const currentUserInfo = localStorage.getItem('userInfo');
    if (currentUserInfo) {
      const user = JSON.parse(currentUserInfo);
      setUserInfo(user);

      // 设置表单初始值
      form.setFieldsValue({
        username: user.username || '',
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '保密',

        school: user.school || '',
        major: user.major || '',
        grade: user.grade || '',
        bio: user.bio || '这个人很懒，什么都没留下'
      });

      // 设置头像
      if (user.avatar) {
        setAvatar([{ url: user.avatar }]);
      }
    }
  }, [form]);

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 头像上传
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar([{ url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // 触发文件选择
  const triggerFileInput = () => {
    document.getElementById('avatar-input').click();
  };

  // 保存资料
  const handleSave = async (values) => {
    setLoading(true);
    try {
      // 准备要更新的数据
      const updateData = {
        username: values.username,
        nickname: values.nickname,
        email: values.email,
        phone: values.phone,
        gender: values.gender,

        school: values.school,
        major: values.major,
        grade: values.grade,
        bio: values.bio
      };

      // 如果有新头像，添加到更新数据中
      if (avatar.length > 0) {
        updateData.avatar = avatar[0].url;
      }

      // 调用API更新用户信息
      const response = await updateUserProfile(updateData);

      // 更新本地存储的用户信息
      const updatedUserInfo = {
        ...userInfo,
        ...response.data
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

      // Toast.success在axios拦截器中已经处理
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error('保存失败:', error);
      // Toast.fail在axios拦截器中已经处理
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className={styles.editProfile}>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.editProfile}>
      {/* 头部导航 */}
      <div className={styles.header}>
        <div className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={20} />
        </div>
        <div className={styles.title}>编辑资料</div>
        <div className={styles.placeholder}></div>
      </div>

      {/* 表单内容 */}
      <div className={styles.content}>
        <Form
          form={form}
          onFinish={handleSave}
          className={styles.form}
        >
          {/* 头像上传 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>头像</div>
            <div className={styles.avatarSection}>
              <div className={styles.avatarUploader} onClick={triggerFileInput}>
                {avatar.length > 0 ? (
                  <img src={avatar[0].url} alt="头像" className={styles.avatarPreview} />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <PhotoO size={24} />
                    <span>上传头像</span>
                  </div>
                )}
              </div>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* 用户名 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>用户名</div>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 50, message: '用户名不能超过50个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
              ]}
            >
              <Input
                placeholder="请输入用户名"
                className={styles.input}
                maxLength={50}
              />
            </Form.Item>
          </div>

          {/* 昵称 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>昵称</div>
            <Form.Item
              name="nickname"
              rules={[
                { max: 100, message: '昵称不能超过100个字符' }
              ]}
            >
              <Input
                placeholder="请输入昵称"
                className={styles.input}
                maxLength={100}
              />
            </Form.Item>
          </div>

          {/* 邮箱 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>邮箱</div>
            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: '请输入正确的邮箱格式' },
                { max: 100, message: '邮箱不能超过100个字符' }
              ]}
            >
              <Input
                placeholder="请输入邮箱"
                className={styles.input}
                maxLength={100}
              />
            </Form.Item>
          </div>

          {/* 手机号 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>手机号</div>
            <Form.Item
              name="phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input
                placeholder="请输入手机号"
                className={styles.input}
                maxLength={11}
              />
            </Form.Item>
          </div>

          {/* 性别 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>性别</div>
            <Form.Item name="gender">
              <Input
                placeholder="请选择性别"
                className={styles.input}
                readonly
                onClick={() => setShowGenderPicker(true)}
              />
            </Form.Item>
          </div>



          {/* 学校 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>学校</div>
            <Form.Item
              name="school"
              rules={[
                { max: 100, message: '学校名称不能超过100个字符' }
              ]}
            >
              <Input
                placeholder="请输入学校"
                className={styles.input}
                maxLength={100}
              />
            </Form.Item>
          </div>

          {/* 专业 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>专业</div>
            <Form.Item
              name="major"
              rules={[
                { max: 100, message: '专业名称不能超过100个字符' }
              ]}
            >
              <Input
                placeholder="请输入专业"
                className={styles.input}
                maxLength={100}
              />
            </Form.Item>
          </div>

          {/* 年级 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>年级</div>
            <Form.Item
              name="grade"
              rules={[
                { max: 20, message: '年级不能超过20个字符' }
              ]}
            >
              <Input
                placeholder="请输入年级（如：大一、研一等）"
                className={styles.input}
                maxLength={20}
              />
            </Form.Item>
          </div>

          {/* 个人简介 */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>个人简介</div>
            <Form.Item
              name="bio"
              rules={[
                { max: 500, message: '个人简介不能超过500个字符' }
              ]}
            >
              <Input.TextArea
                placeholder="请输入个人简介"
                className={styles.textarea}
                maxLength={500}
                rows={4}
                showWordLimit
              />
            </Form.Item>
          </div>

          {/* 保存按钮 */}
          <div className={styles.saveSection}>
            <Button
              type="primary"
              nativeType="submit"
              loading={loading}
              className={styles.saveButton}
              block
            >
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </Form>
      </div>

      {/* 性别选择器 */}
      <Picker
        visible={showGenderPicker}
        onCancel={() => setShowGenderPicker(false)}
        onConfirm={(values) => {
          form.setFieldValue('gender', values[0]);
          setShowGenderPicker(false);
        }}
        columns={[genderOptions]}
        title="选择性别"
      />


    </div>
  );
}