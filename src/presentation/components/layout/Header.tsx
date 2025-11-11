'use client';

import { useState } from 'react';
import { getDistributorData } from '@/src/infrastructure/helpers/authHelper';
import { clearCookies } from '@/src/infrastructure/helpers/cookieHelper';
import { useRouter } from 'next/navigation';
import { Distributor } from '@/src/infrastructure/types/services/auth/auth.types';
import styles from './Header.module.scss';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [distributorData] = useState<Distributor | null>(() => getDistributorData());

  const handleLogout = () => {
    clearCookies();
    router.push('/auth/sign-in');
  };

  const displayTitle = title || distributorData?.business_name || 'Cargando...';
  const displaySubtitle = subtitle || distributorData?.email || '';

  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{displayTitle}</h1>
        {displaySubtitle && <span className={styles.subtitle}>{displaySubtitle}</span>}
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className={styles.label}>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
