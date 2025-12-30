import styles from './index.module.less';
import { Search, Plus, CommentO, LikeO, ShareO, Exchange } from '@react-vant/icons';
import axios from '@/api/axios';
import { createFromIconfontCN } from '@react-vant/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@/utils/index.js'
import Tabbar from '@/components/Tabbar/Tabbar';
import tabbarStyles from '@/components/Tabbar/Tabbar.module.less';

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
)

export default function Home() {
  const navigate = useNavigate()
  const [postList, setPostList] = useState([])

  const fetchPostList = async () => {
    try {
      const res = await axios.get('/post/list')
      setPostList(res.data)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    fetchPostList()
  }, [])

  return (
    <div className={tabbarStyles['page-with-tabbar']}>
      <div className={styles['header']}>
        <div className={styles['avatar-container']}>
          {/* Placeholder for user avatar in header if needed, or just keep it simple */}
        </div>
        <div className={styles['title']}>
          <img src="https://img.icons8.com/color/48/twitter--v1.png" alt="Logo" className={styles['logo']} />
        </div>
        <div className={styles['header-right']}>
          <Search fontSize={20} />
        </div>
      </div>

      <div className={styles['content']}>
        {
          postList.map((item) => (
            <div className={styles['post-item']} key={item.id} onClick={() => {
              navigate(`/post/detail/${item.id}`)
            }}>
              <div className={styles['post-avatar']}>
                <img src={item.avatar} alt="" />
              </div>

              <div className={styles['post-content-wrapper']}>
                <div className={styles['post-header']}>
                  <span className={styles['post-name']}>{item.nickname}</span>
                  <span className={styles['post-handle']}>@{item.username || 'user'}</span>
                  <span className={styles['post-dot']}>·</span>
                  <span className={styles['post-time']}>{formatTime(item.updated_at)}</span>
                </div>

                <div className={styles['post-text']}>
                  {item.content}
                </div>

                {
                  item.image_url && (
                    <div className={styles['post-image']}>
                      <img src={`http://localhost:3000${item.image_url}`} alt="" />
                    </div>
                  )
                }

                <div className={styles['post-actions']}>
                  <div className={styles['action-item']} onClick={(e) => { e.stopPropagation(); }}>
                    <CommentO />
                    <span>{item.comment_count || 0}</span>
                  </div>
                  <div className={styles['action-item']} onClick={(e) => { e.stopPropagation(); }}>
                    <Exchange />
                    <span>{item.repost_count || 0}</span>
                  </div>
                  <div className={styles['action-item']} onClick={(e) => { e.stopPropagation(); }}>
                    <LikeO />
                    <span>{item.like_count || 0}</span>
                  </div>
                  <div className={styles['action-item']} onClick={(e) => { e.stopPropagation(); }}>
                    <ShareO />
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <Tabbar />

      {/* 浮动发布按钮 */}
      <div
        className={styles['floating-publish-btn']}
        onClick={() => navigate('/publish')}
      >
        <Plus size={24} />
      </div>
    </div>
  )
}