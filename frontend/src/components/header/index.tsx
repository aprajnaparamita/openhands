import logo from '@/assets/images/logo.png';
import { ConnectButton } from '@particle-network/connectkit';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles['nav-start']}>
          <Link to="/" className={styles['nav-start-slogan']}>Open Hands</Link>
          <img src={logo} width={36} height={36} alt='logo'></img>
        </div>
        <div className={styles['nav-content']}>
          <Link to="/dashboard" className={styles['nav-item']}>
            Projects
          </Link>
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
