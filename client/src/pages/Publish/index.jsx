import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PhotoO, Close } from '@react-vant/icons';
import { publishPost } from '../../api/post';
import styles from './index.module.less';

export default function Publish() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    content: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 处理文本内容变化
  const handleContentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, content: value }));

    // 清除内容相关错误
    if (errors.content && value.trim()) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  // 处理图片选择
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: '请选择 JPG、PNG 或 GIF 格式的图片' }));
      return;
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: '图片大小不能超过 5MB' }));
      return;
    }

    // 清除图片相关错误
    setErrors(prev => ({ ...prev, image: '' }));

    // 设置图片和预览
    setFormData(prev => ({ ...prev, image: file }));

    // 创建预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = '请输入发布内容';
    } else if (formData.content.trim().length < 5) {
      newErrors.content = '发布内容至少需要5个字符';
    } else if (formData.content.trim().length > 500) {
      newErrors.content = '发布内容不能超过500个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 发布帖子
  const handlePublish = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // 创建FormData对象
      const submitData = new FormData();
      submitData.append('content', formData.content.trim());

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await publishPost(submitData);

      if (response.code === '1') {
        // 发布成功，返回首页
        navigate('/', { replace: true });
      } else {
        setErrors({ submit: response.msg || '发布失败，请重试' });
      }
    } catch (error) {
      console.error('发布错误:', error);
      setErrors({ submit: '网络错误，请检查网络连接后重试' });
    } finally {
      setLoading(false);
    }
  };

  // 字符计数
  const characterCount = formData.content.length;
  const maxCharacters = 500;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className={styles.container}>
      {/* 头部导航 */}
      <div className={styles.header}>
        <div className={styles.headerLeft} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </div>
        <div className={styles.headerCenter}>
          <span className={styles.headerTitle}>发布动态</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.publishBtn} ${formData.content.trim() && !isOverLimit ? styles.active : ''}`}
            onClick={handlePublish}
            disabled={loading || !formData.content.trim() || isOverLimit}
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className={styles.content}>
        {/* 文本输入区域 */}
        <div className={styles.textSection}>
          <textarea
            value={formData.content}
            onChange={handleContentChange}
            placeholder={`分享你的校园生活...

可以分享：
• 学习心得和经验
• 校园活动和趣事
• 美食推荐
• 学习资源
• 生活感悟`}
            className={`${styles.textInput} ${errors.content ? styles.error : ''}`}
            disabled={loading}
          />

          {/* 字符计数 */}
          <div className={`${styles.characterCount} ${isOverLimit ? styles.overLimit : ''}`}>
            {characterCount}/{maxCharacters}
          </div>

          {/* 内容错误提示 */}
          {errors.content && (
            <div className={styles.errorMessage}>{errors.content}</div>
          )}
        </div>

        {/* 图片区域 */}
        <div className={styles.imageSection}>
          {imagePreview ? (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="预览" />
              <button
                className={styles.removeImageBtn}
                onClick={handleRemoveImage}
                disabled={loading}
              >
                <Close size={16} />
              </button>
            </div>
          ) : (
            <div
              className={styles.imageUpload}
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              <PhotoO size={24} />
              <span>添加图片</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            disabled={loading}
          />

          {/* 图片错误提示 */}
          {errors.image && (
            <div className={styles.errorMessage}>{errors.image}</div>
          )}
        </div>

        {/* 发布提示 */}
        <div className={styles.publishTips}>
          <h4>发布须知</h4>
          <ul>
            <li>请发布积极正面的内容，共建和谐校园环境</li>
            <li>不得发布违法违规、虚假信息或恶意内容</li>
            <li>尊重他人隐私，不得未经同意发布他人信息</li>
            <li>支持 JPG、PNG、GIF 格式图片，大小不超过 5MB</li>
          </ul>
        </div>

        {/* 提交错误提示 */}
        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}
      </div>
    </div>
  );
}