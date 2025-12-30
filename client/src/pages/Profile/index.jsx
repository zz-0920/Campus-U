import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, SettingO } from '@react-vant/icons';
import { createFromIconfontCN } from '@react-vant/icons';
import Tabbar from '@/components/Tabbar/Tabbar';
import { formatTime } from '@/utils/index.js';
import styles from './index.module.less';
import axios from '@/api/axios';
import { Tabs } from 'react-vant';

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
);

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      const currentUserInfo = localStorage.getItem('userInfo');
      if (currentUserInfo) {
        const currentUser = JSON.parse(currentUserInfo);

        // 检查是否是当前用户的个人资料页面
        // 如果没有ID参数，或者ID参数匹配当前用户ID
        if (!id || parseInt(id) === currentUser.id) {
          setUserInfo(currentUser);
          setIsCurrentUser(true);
          fetchUserPosts(currentUser.id);
        } else {
          // TODO: Fetch other user info from API
          // For now, mock it or use current user as fallback for demo
          setUserInfo(currentUser);
          setIsCurrentUser(false);
          fetchUserPosts(currentUser.id); // Mocking fetching posts for "other" user
        }
      }
      setLoading(false);
    }
    fetchUserInfo();
  }, [id]);

  const fetchUserPosts = async (userId) => {
    try {
      setLoadingPosts(true);
      const res = await axios.get(`/post/user/${userId}`);
      setUserPosts(res.data);
    } catch (error) {
      console.error('获取用户帖子失败:', error);
    } finally {
      setLoadingPosts(false);
    }
  }

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
      {/* Header with Banner */}
      <div className={styles.header}>
        <div className={styles.banner}>
          {/* Placeholder for banner image */}
        </div>
        <div className={styles.headerContent}>
          <div className={styles.topBar}>
            <div className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft />
            </div>
            <div className={styles.searchBar}>
              {/* Optional search or title */}
            </div>
            <div className={styles.settingBtn} onClick={() => navigate('/setting')}>
              <SettingO />
            </div>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.avatarWrapper}>
              <img
                src={userInfo.avatar}
                alt="头像"
                className={styles.avatar}
              />
            </div>
            <div className={styles.actionButtons}>
              {isCurrentUser ? (
                <button className={styles.editProfileBtn} onClick={handleEditProfile}>
                  编辑资料
                </button>
              ) : (
                <button className={styles.followBtn}>
                  关注
                </button>
              )}
            </div>
          </div>

          <div className={styles.userDetails}>
            <div className={styles.name}>{userInfo.nickname || '用户昵称'}</div>
            <div className={styles.handle}>@{userInfo.username || 'username'}</div>
            <div className={styles.bio}>{userInfo.signature || '这个人很懒，什么都没留下'}</div>
            <div className={styles.joinDate}>
              <IconFont name="icon-rili" /> 加入于 2023年9月
            </div>
            <div className={styles.stats}>
              <span className={styles.statItem}><strong>120</strong> 正在关注</span>
              <span className={styles.statItem}><strong>45</strong> 关注者</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <Tabs>
          <Tabs.TabPane key="posts" title="帖子">
            <div className={styles.postsList}>
              {loadingPosts ? (
                <div className={styles.loadingPosts}>加载中...</div>
              ) : userPosts.length > 0 ? (
                userPosts.map(item => (
                  <div className={styles.postItem} key={item.id} onClick={() => navigate(`/post/detail/${item.id}`)}>
                    <div className={styles.postAvatar}>
                      <img src={item.avatar} alt="" />
                    </div>
                    <div className={styles.postContent}>
                      <div className={styles.postHeader}>
                        <span className={styles.postName}>{item.nickname}</span>
                        <span className={styles.postHandle}>@{userInfo.username || 'user'}</span>
                        <span className={styles.postDot}>·</span>
                        <span className={styles.postTime}>{formatTime(item.updated_at)}</span>
                      </div>
                      <div className={styles.postText}>{item.content}</div>
                      {item.image_url && (
                        <div className={styles.postImage}>
                          <img src={`http://localhost:3000${item.image_url}`} alt="" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyPosts}>
                  <div className={styles.emptyTitle}>还没有发布过帖子</div>
                  <div className={styles.emptyDesc}>当发布帖子后，它们会显示在这里。</div>
                </div>
              )}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="replies" title="回复">
            <div className={styles.emptyPosts}>
              <div className={styles.emptyTitle}>暂无回复</div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="media" title="媒体">
            <div className={styles.emptyPosts}>
              <div className={styles.emptyTitle}>暂无媒体</div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="likes" title="喜欢">
            <div className={styles.emptyPosts}>
              <div className={styles.emptyTitle}>暂无喜欢的内容</div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>

      <Tabbar />
    </div>
  );
}
