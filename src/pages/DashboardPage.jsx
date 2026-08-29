import { useState, useEffect } from "react";
import { Layout, Drawer, theme } from "antd";
import Sidebar from "../components/Common/Sidebar";
import Header from "../components/Common/Header";
import ChatbotFAB from "../components/Common/ChatbotFAB";

const { Content } = Layout;

function DashboardPage({ navItems, activeKey, onNavChange, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { token: themeToken } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleCollapse = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleNavClick = (key) => {
    onNavChange(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  return (
    <Layout style={{ 
      minHeight: "100vh",
      background: themeToken.colorBgBase
    }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          collapsed={collapsed} 
          activeNav={activeKey} 
          onNavChange={handleNavClick} 
          navItems={navItems} 
        />
      )}

      {/* Mobile Drawer Sidebar */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          width={260}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          <Sidebar 
            collapsed={false} 
            activeNav={activeKey} 
            onNavChange={handleNavClick} 
            navItems={navItems} 
          />
        </Drawer>
      )}

      <Layout style={{
        background: themeToken.colorBgBase,
        minWidth: 0,
        overflow: "hidden"
      }}>
        <Header 
          collapsed={isMobile ? !mobileDrawerOpen : collapsed} 
          onCollapseToggle={handleToggleCollapse} 
          activeNav={activeKey} 
          navItems={navItems} 
          isMobile={isMobile}
        />

        <Content className="dashboard-main-content" style={{ 
          margin: isMobile ? "12px 8px" : 24,
          background: themeToken.colorBgBase,
          minHeight: "calc(100vh - 112px)"
        }}>
          {children}
        </Content>
      </Layout>

      <ChatbotFAB />
    </Layout>
  );
}

export default DashboardPage;