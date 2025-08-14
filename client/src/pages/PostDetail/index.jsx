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
  const [comments, setComments] = useState([])
  const [showCommentModal, setShowCommentModal] = useState(false)


  const fetchPost = async () => {
    try {
      setLoading(true)
      const PostDetail = await axios.get(`/post/detail/${id}`)
      const like_info = await axios.get(`/post/likes/${id}`)
      const comment = await axios.get(`/post/comments/${id}`)
      setPost(PostDetail.data)
      setLikeCount(like_info.data.like_count || 0)
      setLiked(like_info.data.isLiked || false)
      setComments(comment.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleLike = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const response = await axios.post(`/post/likes`, {
        post_id: id,
        user_id: userInfo.id
      })
      
      // 根据后端返回的action更新状态
      if (response.data.action === 'liked') {
        setLiked(true)
        setLikeCount(prev => prev + 1)
      } else if (response.data.action === 'unliked') {
        setLiked(false)
        setLikeCount(prev => prev - 1)
      }
    } catch (error) {
      console.log(error)
      // 如果请求失败，恢复之前的状态
      if (liked) {
        setLiked(false)
        setLikeCount(prev => prev - 1)
      } else {
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }
    }
  }

  const handleShare = () => {
    // 分享功能
    console.log('分享动态')
  }

  const handleComment = () => {
    // 评论功能
    setShowCommentModal(true)
  }

  const handleCommentReply = (commentId, nickname) => {
    // 回复评论功能
    console.log('回复评论:', commentId, nickname)
    setShowCommentModal(true)
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
            <span>{comments.comment_count} 评论</span>
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
          <h3>评论 {comments.comment_count || 0}</h3>
        </div>
        <div className={styles['comments-list']}>
          {comments.comments && comments.comments.length > 0 ? (
            comments.comments.map((item) => (
              <div className={styles['comment-item']} key={item.id}>
                <div className={styles['comment-avatar']}>
                  <img src={item.avatar} alt="" />
                </div>
                <div className={styles['comment-content']}>
                  <div className={styles['comment-main']}>
                    <div className={styles['comment-user']}>
                      <span className={styles['comment-nickname']}>{item.nickname}</span>
                      <span className={styles['comment-time']}>{formatTime(item.created_at)}</span>
                    </div>
                    <p className={styles['comment-text']}>{item.content}</p>
                    <div className={styles['comment-actions']}>
                      <div className={styles['comment-action']} onClick={() => handleCommentReply(item.id, item.nickname)}>
                        <IconFont name="icon-pinglun" style={{fontSize: '14px', color: '#999'}} />
                        <span>回复</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles['no-comments']}>
              <div className={styles['no-comments-icon']}>
                <IconFont name="icon-pinglun" style={{fontSize: '48px', color: '#ddd'}} />
              </div>
              <p>还没有评论，快来抢沙发吧~</p>
            </div>
          )}
        </div>
        
        {/* 评论输入框 */}
        <div className={styles['comment-input-section']}>
          <div className={styles['comment-input-wrapper']}>
            <input 
              type="text" 
              placeholder="写评论..." 
              className={styles['comment-input']}
              onFocus={() => setShowCommentModal(true)}
            />
            <div className={styles['comment-emoji']}>
              <IconFont name="icon-biaoqing" style={{fontSize: '20px', color: '#999'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}