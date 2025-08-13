import styles from './index.module.less'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from '@/api/axios'
import { formatTime } from '@/utils/index.js'
import { ArrowLeft, LikeO, ShareO, MoreO } from '@react-vant/icons'
import { createFromIconfontCN } from '@react-vant/icons'

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
)

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState({})
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const fetchPost = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/post/detail/${id}`)
      setPost(res.data)
      setLikeCount(res.data.like_count || 0)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleShare = () => {
    // 分享功能
    console.log('分享动态')
  }

  const handleComment = () => {
    // 评论功能
    console.log('评论动态')
  }

  useEffect(() => {
    fetchPost()
  }, [id])

  if (loading) {
    return (
      <div className={styles['loading']}>
        <div className={styles['loading-spinner']}></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className={styles['post-detail']}>
      {/* 顶部导航栏 */}
      <div className={styles['header']}>
        <div className={styles['header-left']} onClick={handleBack}>
          <ArrowLeft />
        </div>
        <div className={styles['header-title']}>动态详情</div>
        <div className={styles['header-right']}>
          <MoreO />
        </div>
      </div>

      {/* 动态内容 */}
      <div className={styles['content']}>
        {/* 用户信息 */}
        <div className={styles['user-info']}>
          <div className={styles['user-avatar']}>
            <img src={post.avatar} alt="" />
          </div>
          <div className={styles['user-details']}>
            <div className={styles['user-name']}>{post.nickname}</div>
            <div className={styles['post-time']}>{formatTime(post.updated_at)}</div>
          </div>
        </div>

        {/* 动态文本内容 */}
        <div className={styles['post-content']}>
          <p>{post.content}</p>
        </div>

        {/* 动态图片 */}
        {post.image_url && (
          <div className={styles['post-image']}>
            <img src={post.image_url} alt="" />
          </div>
        )}

        {/* 点赞和浏览数据 */}
        <div className={styles['post-stats']}>
          <div className={styles['stats-item']}>
            <span>{likeCount} 次点赞</span>
          </div>
          <div className={styles['stats-item']}>
            <span>128 次浏览</span>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className={styles['action-bar']}>
        <div className={styles['action-item']} onClick={handleLike}>
          <LikeO color={liked ? '#ff4757' : '#666'} />
          <span style={{ color: liked ? '#ff4757' : '#666' }}>点赞</span>
        </div>
        <div className={styles['action-item']} onClick={handleComment}>
          <IconFont name='icon-pinglun' />
          <span>评论</span>
        </div>
        <div className={styles['action-item']} onClick={handleShare}>
          <ShareO />
          <span>分享</span>
        </div>
      </div>

      {/* 评论区域 */}
      <div className={styles['comments-section']}>
        <div className={styles['comments-header']}>
          <h3>评论</h3>
        </div>
        <div className={styles['comments-list']}>
          {/* 这里可以添加评论列表 */}
          <div className={styles['no-comments']}>
            <p>暂无评论，快来抢沙发吧~</p>
          </div>
        </div>
      </div>
    </div>
  )
}
