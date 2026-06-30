import { useState } from "react";
import { Layout } from "antd";
import Sidebar from "../components/Common/Sidebar";
import Header from "../components/Common/Header";
import ChatbotFAB from "../components/Common/ChatbotFAB";

const { Content } = Layout;

function DashboardPage({ navItems, activeKey, onNavChange, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar 
        collapsed={collapsed} 
        activeNav={activeKey} 
        onNavChange={onNavChange} 
        navItems={navItems} 
      />

      <Layout>
        <Header 
          collapsed={collapsed} 
          onCollapseToggle={() => setCollapsed(!collapsed)} 
          activeNav={activeKey} 
          navItems={navItems} 
        />

        <Content style={{ margin: 24 }}>
          {children}
        </Content>
      </Layout>

      <ChatbotFAB />
    </Layout>
  );
}

export default DashboardPage;