import logo from '@/assets/images/logo.png';
import { ConnectButton } from '@particle-network/connectkit';
import styles from './index.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles['nav-start']}>
          <div className={styles['nav-start-slogan']}>Open Hands</div>
          <img src={logo} width={36} height={36} alt='logo'></img>
        </div>
        <div className={styles['nav-content']}>
          <a href='https://github.com/aprajnaparamita/openhands' target='_blank' className={styles['nav-item']} rel='noreferrer'>
            Github
          </a>
        </div>
        <div className={styles['nav-end']}>
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
}
