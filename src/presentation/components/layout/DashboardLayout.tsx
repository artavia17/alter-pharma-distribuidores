'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '../auth/ProtectedRoute';
import styles from './DashboardLayout.module.scss';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.main}>
          <Header title={title} subtitle={subtitle} />
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
