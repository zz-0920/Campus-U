import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from '@react-vant/icons';
import { getChatMessages, sendMessage } from '../../api/message';
import styles from './index.module.less';

export default function MessageDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            setCurrentUserId(user.id);
        }
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await getChatMessages(userId);

            if (response.code === '1') {
                setMessages(response.data);

                if (response.data.length > 0) {
                    const firstMessage = response.data[0];
                    const chatUserInfo = {
                        id: parseInt(userId),
                        nickname: firstMessage.sender_id === currentUserId
                            ? firstMessage.receiver_nickname
                            : firstMessage.sender_nickname,
                        avatar: firstMessage.sender_id === currentUserId
                            ? firstMessage.receiver_avatar
                            : firstMessage.sender_avatar
                    };
                    setChatUser(chatUserInfo);
                }
            } else {
                console.error('获取聊天记录失败:', response.msg);
            }
        } catch (error) {
            console.error('获取聊天记录错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const response = await sendMessage({
                receiverId: parseInt(userId),
                content: newMessage.trim(),
                messageType: 'text'
            });

            if (response.code === '1') {
                setMessages(prev => [...prev, response.data]);
                setNewMessage('');

                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            } else {
                console.error('发送消息失败:', response.msg);
            }
        } catch (error) {
            console.error('发送消息错误:', error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timeString) => {
        const messageTime = new Date(timeString);
        const now = new Date();
        const diffTime = now - messageTime;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return messageTime.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else if (diffDays === 1) {
            return '昨天 ' + messageTime.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else {
            return messageTime.toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit'
            }) + ' ' + messageTime.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    };

    useEffect(() => {
        if (currentUserId) {
            fetchMessages();
        }
    }, [userId, currentUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft} onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </div>
                <div className={styles.headerCenter}>
                    <div className={styles.chatUserInfo}>
                        {chatUser && (
                            <>
                                <img
                                    src={chatUser.avatar}
                                    alt={chatUser.nickname}
                                    className={styles.headerAvatar}
                                />
                                <span className={styles.headerNickname}>{chatUser.nickname}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <Plus size={20} />
                </div>
            </div>

            <div className={styles.messagesContainer}>
                {loading ? (
                    <div className={styles.loading}>加载中...</div>
                ) : messages.length > 0 ? (
                    <div className={styles.messagesList}>
                        {messages.map((message, index) => {
                            const isCurrentUser = message.sender_id === currentUserId;
                            const showTime = index === 0 ||
                                (new Date(message.created_at) - new Date(messages[index - 1].created_at)) > 5 * 60 * 1000;

                            return (
                                <div key={message.id} className={styles.messageGroup}>
                                    {showTime && (
                                        <div className={styles.timeStamp}>
                                            {formatTime(message.created_at)}
                                        </div>
                                    )}
                                    <div className={`${styles.messageItem} ${isCurrentUser ? styles.currentUser : styles.otherUser}`}>
                                        <img
                                            src={message.sender_avatar}
                                            alt={message.sender_nickname}
                                            className={styles.messageAvatar}
                                        />
                                        <div className={styles.messageContent}>
                                            <div className={styles.messageBubble}>
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className={styles.emptyState}>暂无聊天记录，开始对话吧！</div>
                )}
            </div>

            <div className={styles.inputContainer}>
                <div className={styles.inputWrapper}>
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        className={styles.messageInput}
                        rows={1}
                        disabled={sending}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className={`${styles.sendButton} ${newMessage.trim() ? styles.active : ''}`}
                    >
                        {sending ? '发送中' : '发送'}
                    </button>
                </div>
            </div>
        </div>
    );
}