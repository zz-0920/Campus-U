import Tabbar from '@/components/Tabbar/Tabbar';
import styles from './index.module.less'
import { WapNav, VolumeO } from '@react-vant/icons';
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

  const handleSystemMessageClick = () => {
    console.log('查看系统消息');
    // 这里可以添加系统消息页面跳转逻辑
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
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles['header']}>
        <div className={styles['title']}>
          校园U+
        </div>
        <div className={styles['search']}>
          <WapNav  />
        </div>
      </div>
      
      <div className={styles.chatList}>
        {/* 系统消息置顶 */}
        <div className={styles.systemMessage} onClick={handleSystemMessageClick}>
          <div className={styles.systemAvatar}>
            <VolumeO />
          </div>
          <div className={styles.systemContent}>
            <div className={styles.systemName}>系统消息</div>
            <div className={styles.systemText}>欢迎使用校园U+，开始你的校园社交之旅！</div>
          </div>
          <div className={styles.systemTime}>今天</div>
        </div>

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
                  <div className={styles.time}>{formatTime(chat.last_message_time)}</div>
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
          <div className={styles.emptyState}>暂无聊天记录</div>
        )}
      </div>
      
      <Tabbar />
    </div>
  )
}
