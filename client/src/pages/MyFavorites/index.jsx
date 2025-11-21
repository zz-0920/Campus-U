import styles from './index.module.less';
import { ArrowLeft } from '@react-vant/icons';
import axios from '@/api/axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@/utils/index.js';
import { Toast } from 'react-vant';

export default function MyFavorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // 检查是否有accessToken
        const accessToken = localStorage.getItem('accessToken');
        console.log('AccessToken存在:', !!accessToken);
        
        if (!accessToken) {
          console.error('没有找到accessToken，请重新登录');
          navigate('/login');
          return;
        }
        
        const response = await axios.get('/post/favorites');
        console.log('API响应:', response);
        
        if (response.code === '1') {
           setFavorites(response.data);
         } else {
          console.error('获取点赞失败:', response.msg);
        }
      } catch (error) {
        console.error('获取点赞失败:', error);
        console.error('错误详情:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  return (
    <div className={styles['my-favorites-page']}>
      {/* 头部导航 */}
      <div className={styles['header']}>
        <div className={styles['header-left']} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </div>
        <div className={styles['title']}>
          我的点赞
        </div>
        <div className={styles['header-right']}></div>
      </div>

      {/* 内容区域 */}
      <div className={styles['content']}>
        {loading ? (
          <div className={styles['loading']}>
            <div className={styles['loading-text']}>加载中...</div>
          </div>
        ) : favorites.length === 0 ? (
          <div className={styles['empty']}>
            <div className={styles['empty-icon']}>❤️</div>
            <div className={styles['empty-text']}>还没有点赞任何帖子</div>
            <div className={styles['empty-desc']}>去发现一些有趣的内容点赞收藏吧！</div>
          </div>
        ) : (
          favorites.map((item) => (
            <div className={styles['content-item']} key={item.id} onClick={() => {
              navigate(`/post/detail/${item.id}`);
            }}>
              <div className={styles['content-item-header']}>
                <div className={styles['content-item-header-avatar']}>
                  <img src={item.avatar} alt="" />
                </div>
                <p className={styles['content-item-header-name']}>
                  {item.nickname}
                </p>
                <div className={styles['content-item-header-time']}>
                  {formatTime(item.updated_at)}
                </div>
              </div>
              <div className={styles['content-item-content']}>
                <p>
                  {item.content}
                </p>
                {
                  item.image_url && (
                    <div className={styles['content-item-content-image']}>
                      <img src={`http://localhost:3000${item.image_url}`} alt="" />
                    </div>
                  )
                }
              </div>
              {/* 点赞收藏标识 */}
              <div className={styles['favorite-badge']}>
                <span>❤️ 已点赞</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}