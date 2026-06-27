import { useState } from "react";
import { Layout } from "antd";
import AdminSidebar from "../components/AdminDashboard/AdminSidebar";
import AdminHeader from "../components/AdminDashboard/AdminHeader";
import DashboardContent from "../components/AdminDashboard/DashboardContent";
import "../styles/AdminDashboard.css";

const { Content } = Layout;

function AdminDashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar
        collapsed={collapsed}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <Layout>
        <AdminHeader
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed(!collapsed)}
          activeNav={activeNav}
        />

        <Content style={{ margin: 24 }}>
          <DashboardContent activeNav={activeNav} />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminDashboardPage;
