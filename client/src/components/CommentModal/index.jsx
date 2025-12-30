import { useState } from 'react'
import { Cross } from '@react-vant/icons'
import styles from './index.module.less'
import axios from '@/api/axios'

export default function CommentModal({ visible, onClose, postId, onCommentSubmit }) {
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 处理评论提交
  const handleSubmit = async () => {
    if (!commentText.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      // 调用后端API提交评论
      const response = await axios.post('/post/comments', {
        postId: postId,
        content: commentText.trim()
      })

      // 成功后回调父组件
      if (onCommentSubmit) {
        onCommentSubmit(response.data)
      }

      // 清空输入框并关闭弹窗
      setCommentText('')
      onClose()
    } catch (error) {
      console.error('评论提交失败:', error)
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理键盘事件 - Cmd/Ctrl + Enter 发布
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // 阻止背景滚动
  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  if (!visible) {
    return null
  }

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={handleModalClick}>
        {/* 弹窗头部 */}
        <div className={styles['modal-header']}>
          <button className={styles['close-btn']} onClick={onClose}>
            <Cross />
          </button>
          <button
            className={`${styles['submit-btn']} ${!commentText.trim() || isSubmitting ? styles['disabled'] : ''}`}
            onClick={handleSubmit}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? '发布中...' : '发布'}
          </button>
        </div>

        {/* 评论输入区域 */}
        <div className={styles['comment-input-area']}>
          <textarea
            className={styles['comment-textarea']}
            placeholder="发布你的回复"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={280}
            autoFocus
          />
          <div className={styles['input-footer']}>
            <div className={styles['hint-text']}>
              {commentText.length === 0 && '按 Cmd/Ctrl + Enter 发布'}
            </div>
            <div className={styles['char-count']}>
              {commentText.length > 0 && (
                <span className={commentText.length > 280 ? styles['over-limit'] : ''}>
                  {commentText.length}/280
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}