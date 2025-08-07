import styles from './index.module.less'
import { Search, LikeO, ChatO, ShareO, WapHomeO, Contact } from '@react-vant/icons';


import { createFromIconfontCN } from '@react-vant/icons'

const IconFont = createFromIconfontCN(
  '//at.alicdn.com/t/c/font_4993182_m91v3zvdngo.js'
)

export default function Home() {
    const image = 'xxx'

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
        <div className={styles['content-item']}>
          <div className={styles['content-item-title']}>
            <div className={styles['content-item-title-avatar']}>
              <img src="xxx" alt="" />
            </div>
            <p className={styles['content-item-title-name']}>
              xxx
            </p>
            <div className={styles['content-item-title-time']}>
              123
            </div>
          </div>
          <div className={styles['content-item-content']}>
            <p>
              这是一条动态
            </p>
            {
              image && (
                <div className={styles['content-item-content-image']}>
                  <img src={image} alt="" />
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
      </div>
      <div className={styles['footer']}>
        <div className={styles['footer-item']}>
          <div className={styles['footer-item-icon']}>
            <WapHomeO  />
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
