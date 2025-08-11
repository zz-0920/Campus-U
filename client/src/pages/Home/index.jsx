import styles from './index.module.less';
import { Search, LikeO, ChatO, ShareO, WapHomeO, Contact } from '@react-vant/icons';
import axios from '@/api/axios';
import { createFromIconfontCN } from '@react-vant/icons';
import { useEffect, useState } from 'react';

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
)

export default function Home() {
  const [postList, setPostList] = useState([])

  const fetchPostList = async () => {
    try {
      const res = await axios.get('/post/list')
      // console.log(res.data)
      setPostList(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  // 格式化时间显示函数
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  }

  useEffect(() => {
    fetchPostList()
  }, [])

  return (
    <div>
      <div className={styles['header']}>
        <div className={styles['title']}>
          校园U+
        </div>
        <div className={styles['search']}>
          <Search />
        </div>
      </div>
      <div className={styles['content']}>
        {
          postList.map((item) => (
            <div className={styles['content-item']} key={item.id}>
              <div className={styles['content-item-title']}>
                <div className={styles['content-item-title-avatar']}>
                  <img src={item.avatar} alt="" />
                </div>
                <p className={styles['content-item-title-name']}>
                  {item.nickname}
                </p>
                <div className={styles['content-item-title-time']}>
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
                      <img src={item.image_url} alt="" />
                    </div>
                  )
                }
              </div>
              <div className={styles['content-item-footer']}>
                <div className={styles['content-item-footer-item']}>
                  <div>
                    <LikeO />
                    <p>点赞</p>
                  </div>
                  <div>
                    <IconFont name='icon-pinglun' />
                    <p>评论</p>
                  </div>
                  <div>
                    <ShareO />
                    <p>分享</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        }

      </div>
      <div className={styles['footer']}>
        <div className={styles['footer-item']}>
          <div className={styles['footer-item-icon']}>
            <WapHomeO />
            <p>首页</p>
          </div>
          <div className={styles['footer-item-icon']}>
            <IconFont name='icon-faxian1' />
            <p>发现</p>
          </div>
          <div className={styles['footer-item-icon']}>
            <ChatO />
            <p>消息</p>
          </div>
          <div className={styles['footer-item-icon']}>
            <Contact />
            <p>我的</p>
          </div>
        </div>
      </div>

    </div>
  )
}