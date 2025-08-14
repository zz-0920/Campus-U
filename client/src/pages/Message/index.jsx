import Tabbar from '@/components/Tabbar/Tabbar';
import styles from './index.module.less'
import { WapNav } from '@react-vant/icons';


export default function Message() {
  return (
    <div>
      <div className={styles['header']}>
        <div className={styles['title']}>
          校园U+
        </div>
        <div className={styles['search']}>
          <WapNav  />
        </div>
      </div>
      <Tabbar />
    </div>
  )
}
