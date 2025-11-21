import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Setting, Edit, PhotoO, LikeO, ChatO } from '@react-vant/icons';
import { createFromIconfontCN } from '@react-vant/icons';
import Tabbar from '@/components/Tabbar/Tabbar';
import { formatTime } from '@/utils/index.js';
import styles from './index.module.less';

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
);

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // 获取用户信息
  useEffect(() => {
    const currentUserInfo = localStorage.getItem('userInfo');
    if (currentUserInfo) {
      const currentUser = JSON.parse(currentUserInfo);
      
      // 检查是否是当前用户的个人资料页面
      if (parseInt(id) === currentUser.id) {
        setUserInfo(currentUser);
        setIsCurrentUser(true);
      } else {
        // 如果是其他用户的资料页面，这里可以添加获取其他用户信息的API调用
        // 暂时使用当前用户信息作为示例
        setUserInfo(currentUser);
        setIsCurrentUser(false);
      }
    }
    setLoading(false);
  }, [id]);

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  // 编辑资料
  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  // 我的帖子
  const handleMyPosts = () => {
    // 跳转到我的帖子页面，传递用户ID参数
    navigate(`/my-posts/${userInfo.id}`);
  };

  // 我的点赞
  const handleMyFavorites = () => {
    // 跳转到我的点赞页面
    navigate('/my-favorites');
  };

  // 设置
  const handleSettings = () => {
    // 跳转到设置页面
    navigate('/Setting');
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.loading}>加载中...</div>
        <Tabbar />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className={styles.profile}>
        <div className={styles.error}>用户信息加载失败</div>
        <Tabbar />
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      {/* 个人信息区域 */}
      <div className={styles.profileHeader}>
        <div className={styles.userInfoSection}>
          <img 
            src={userInfo.avatar} 
            alt="头像" 
            className={styles.avatar}
          />
          <div className={styles.userDetails}>
            <div className={styles.nickname}>{userInfo.nickname || '用户昵称'}</div>
            <div className={styles.userId}>校园号：{userInfo.username || 'username'}</div>
            <div className={styles.signature}>个性签名：这个人很懒，什么都没留下</div>
          </div>
          {isCurrentUser && (
            <div className={styles.editButton} onClick={handleEditProfile}>
              <Edit size={16} />
            </div>
          )}
        </div>
      </div>

      {/* 功能列表区域 */}
      <div className={styles.menuContainer}>
        {/* 服务分组 */}
        <div className={styles.menuGroup}>
          <div className={styles.menuItem} onClick={handleMyPosts}>
            <div className={styles.menuIcon}>
              <PhotoO />
            </div>
            <span className={styles.menuText}>我的帖子</span>
            <span className={styles.menuArrow}>›</span>
          </div>
          
          <div className={styles.menuItem} onClick={handleMyFavorites}>
            <div className={styles.menuIcon}>
              <LikeO />
            </div>
            <span className={styles.menuText}>我的点赞</span>
            <span className={styles.menuArrow}>›</span>
          </div>

        </div>

        {/* 设置分组 */}
        <div className={styles.menuGroup}>
          <div className={styles.menuItem} onClick={handleSettings}>
            <div className={styles.menuIcon}>
              <Setting />
            </div>
            <span className={styles.menuText}>设置</span>
            <span className={styles.menuArrow}>›</span>
          </div>
          
          {isCurrentUser && (
            <div className={styles.menuItem} onClick={handleLogout}>
              <div className={styles.menuIcon}>
                <ArrowLeft style={{transform: 'rotate(180deg)'}} />
              </div>
              <span className={styles.menuText}>退出登录</span>
              <span className={styles.menuArrow}>›</span>
            </div>
          )}
        </div>
      </div>

      <Tabbar />
    </div>
  );
}
