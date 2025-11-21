import styles from './index.module.less'

export default function Setting() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🚧</div>
        <h2 className={styles.title}>功能开发中</h2>
        <p className={styles.description}>
          该功能正在紧急开发中，敬请期待！
        </p>
        
        <p className={styles.tip}>预计很快上线，感谢您的耐心等待</p>
      </div>
    </div>
  )
}
