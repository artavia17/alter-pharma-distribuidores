'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getDistributorData } from '@/src/infrastructure/helpers/authHelper';
import { clearCookies } from '@/src/infrastructure/helpers/cookieHelper';
import styles from './Sidebar.module.scss';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const distributor = getDistributorData();

  // Cerrar el menú cuando se hace click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const menuItems = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      label: 'Inicio',
      href: '/',
    },
  ];

  return (
    <>
      <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}>
        {/* Logo and Toggle */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              {distributor?.business_name?.charAt(0).toUpperCase() || 'D'}
            </div>
            {isExpanded && (
              <span className={styles.logoText}>
                {
                  distributor?.business_name
                    ? (distributor.business_name.length > 13
                        ? distributor.business_name.slice(0, 13) + "..."
                        : distributor.business_name)
                    : "Distribuidor"
                }
              </span>
            )}
          </div>

          <button
            className={styles.toggleButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Contraer menú' : 'Expandir menú'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isExpanded ? (
                <polyline points="15 18 9 12 15 6"/>
              ) : (
                <polyline points="9 18 15 12 9 6"/>
              )}
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              title={!isExpanded ? item.label : undefined}
            >
              <span className={styles.icon}>{item.icon}</span>
              {isExpanded && <span className={styles.label}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className={styles.userSection} ref={userMenuRef}>
          <div
            className={styles.userCard}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.avatar}>
              <div className={styles.avatarPlaceholder}>
                {distributor?.business_name?.charAt(0).toUpperCase() || 'D'}
              </div>
            </div>

            {isExpanded && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  {distributor?.business_name || 'Distribuidor'}
                </p>
                <p className={styles.userEmail}>
                  {distributor?.email || 'distribuidor@mail.com'}
                </p>
              </div>
            )}
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className={styles.userMenu}>
              <Link href="/cuenta" className={styles.userMenuItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Mi cuenta
              </Link>
              <button
                className={styles.userMenuItem}
                onClick={() => {
                  clearCookies();
                  router.push('/auth/sign-in');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop/Overlay transparente - FUERA del sidebar */}
      {isExpanded && (
        <div
          className={styles.backdrop}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
