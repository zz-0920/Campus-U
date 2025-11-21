import styles from './index.module.less';
import { ArrowLeft } from '@react-vant/icons';
import axios from '@/api/axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTime } from '@/utils/index.js';
import { Toast } from 'react-vant';

export default function MyPosts() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/post/user/${userId}`);
      setPostList(res.data);
    } catch (error) {
      console.error('获取我的帖子失败:', error);
      Toast.fail('获取帖子失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyPosts();
    }
  }, [userId]);

  return (
    <div className={styles['my-posts-page']}>
      {/* 头部导航 */}
      <div className={styles['header']}>
        <div className={styles['header-left']} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </div>
        <div className={styles['title']}>
          我的帖子
        </div>
        <div className={styles['header-right']}></div>
      </div>

      {/* 内容区域 */}
      <div className={styles['content']}>
        {loading ? (
          <div className={styles['loading']}>
            <div className={styles['loading-text']}>加载中...</div>
          </div>
        ) : postList.length === 0 ? (
          <div className={styles['empty']}>
            <div className={styles['empty-icon']}>📝</div>
            <div className={styles['empty-text']}>还没有发布过帖子</div>
            <div className={styles['empty-desc']}>快去发布你的第一条帖子吧！</div>
          </div>
        ) : (
          postList.map((item) => (
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}