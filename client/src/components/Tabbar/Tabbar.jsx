import { WapHomeO, ChatO, Contact } from '@react-vant/icons';
import { createFromIconfontCN } from '@react-vant/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Tabbar.module.less';

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
)

export default function Tabbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路径确定激活的标签
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/discover') return 'discover';
    if (path === '/message') return 'message';
    if (path.startsWith('/profile/')) return 'profile';
    return 'home';
  };

  const handleTabClick = (tabName) => {
    switch (tabName) {
      case 'home':
        navigate('/');
        break;
      case 'discover':
        navigate('/discover');
        break;
      case 'message':
        navigate('/message');
        break;
      case 'profile':
        // 获取当前用户ID并导航到个人资料页面
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          navigate(`/profile/${user.id}`);
        } else {
          navigate('/login');
        }
        break;
      default:
        break;
    }
  };

  const activeTab = getActiveTab();

  return (
    <div className={styles['footer']}>
      <div className={styles['footer-item']}>
        <div 
          className={`${styles['footer-item-icon']} ${activeTab === 'home' ? styles['active'] : ''}`}
          onClick={() => handleTabClick('home')}
        >
          <WapHomeO />
          <p>首页</p>
        </div>
        <div 
          className={`${styles['footer-item-icon']} ${activeTab === 'discover' ? styles['active'] : ''}`}
          onClick={() => handleTabClick('discover')}
        >
          <IconFont name='icon-faxian1' />
          <p>发现</p>
        </div>
        <div 
          className={`${styles['footer-item-icon']} ${activeTab === 'message' ? styles['active'] : ''}`}
          onClick={() => handleTabClick('message')}
        >
          <ChatO />
          <p>消息</p>
        </div>
        <div 
          className={`${styles['footer-item-icon']} ${activeTab === 'profile' ? styles['active'] : ''}`}
          onClick={() => handleTabClick('profile')}
        >
          <Contact />
          <p>我的</p>
        </div>
      </div>
    </div>
  )
}
