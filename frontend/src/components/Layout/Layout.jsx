import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, theme, toggleTheme }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
