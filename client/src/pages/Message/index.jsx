import Tabbar from '@/components/Tabbar/Tabbar';
import styles from './index.module.less'
import { SettingO, Search } from '@react-vant/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatList } from '../../api/message';

export default function Message() {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取聊天列表数据
  const fetchChatList = async () => {
    try {
      setLoading(true);


      const response = await getChatList();
      console.log('API响应:', response);

      if (response.code === '1') {
        setChatList(response.data);
        console.log('聊天列表数据:', response.data);
      } else {
        console.error('获取聊天列表失败:', response.msg);
      }
    } catch (error) {
      console.error('获取聊天列表错误:', error);
      if (error.response) {
        console.error('错误响应:', error.response.data);
        console.error('错误状态:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  const handleChatClick = (chatUserId) => {
    // 导航到聊天详情页面
    navigate(`/message/${chatUserId}`);
  };

  // 格式化时间显示
  const formatTime = (timeString) => {
    const messageTime = new Date(timeString);
    const now = new Date();
    const diffTime = now - messageTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // 今天，显示时间
      return messageTime.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return messageTime.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles['header']}>
        <div className={styles['header-top']}>
          <div className={styles['avatar-placeholder']}></div>
          <div className={styles['title']}>
            消息
          </div>
          <div className={styles['settings']}>
            <SettingO />
          </div>
        </div>
        <div className={styles['search-bar']}>
          <div className={styles['search-input-wrapper']}>
            <Search />
            <input type="text" placeholder="搜索私信" />
          </div>
        </div>
      </div>

      <div className={styles.chatList}>
        {/* 用户聊天列表 */}
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : chatList.length > 0 ? (
          chatList.map(chat => (
            <div
              key={chat.chat_user_id}
              className={styles.chatItem}
              onClick={() => handleChatClick(chat.chat_user_id)}
            >
              <div className={styles.avatar}>
                <img
                  src={chat.avatar || 'https://img01.yzcdn.cn/vant/cat.jpeg'}
                  alt={chat.nickname}
                />
              </div>
              <div className={styles.content}>
                <div className={styles.topRow}>
                  <div className={styles.name}>{chat.nickname}</div>
                  <div className={styles.meta}>
                    <span className={styles.time}>{formatTime(chat.last_message_time)}</span>
                  </div>
                </div>
                <div className={styles.bottomRow}>
                  <div className={styles.lastMessage}>{chat.last_message}</div>
                  {chat.unread_count > 0 && (
                    <div className={styles.unreadBadge}>{chat.unread_count}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>欢迎来到你的收件箱！</div>
            <div className={styles.emptyDesc}>在校园U+上与其他人发私信，进行私密对话。</div>
            <button className={styles.newMessageBtn}>撰写私信</button>
          </div>
        )}
      </div>

      <Tabbar />
    </div>
  )
}
