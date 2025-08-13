import styles from './index.module.less';
import { Search, LikeO, ShareO } from '@react-vant/icons';
import axios from '@/api/axios';
import { createFromIconfontCN } from '@react-vant/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@/utils/index.js'
import Tabbar from '@/components/Tabbar';

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
)

export default function Home() {
  const navigate = useNavigate()
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
            <div className={styles['content-item']} key={item.id} onClick={() => {
              navigate(`/post/detail/${item.id}`)
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
      <Tabbar />
    </div>
  )
}