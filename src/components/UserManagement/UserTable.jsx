import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Button, Tag, Space, Modal, message, Typography, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/adminApi";
import UserModal from "./UserModal";

const { Title } = Typography;

const UserTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setData(response.data || response);
    } catch (error) {
      message.error(error.message || "Failed to load system users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = useCallback((record) => {
    setSelectedUser(record); 
    setModalVisible(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async (userId) => {
    try {
      const response = await adminAPI.deleteUser(userId, "soft");
      message.success("User account deactivated successfully");
      await fetchUsers(); 
    } catch (error) {
      message.error(error.message || "Failed to alter account status");
    }
  }, [fetchUsers]);

  const columns = useMemo(() => [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.user?.first_name || ""} ${record.user?.last_name || ""}`,
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Role",
      dataIndex: ["user", "role"],
      key: "role",
      render: (role) => {
        const colors = { admin: "volcano", teacher: "purple", student: "geekblue", parent: "green" };
        return <Tag color={colors[role] || "default"}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "System Reference ID",
      key: "reference",
      render: (_, record) => {
        if (record.user?.role === "student") return record.profile?.student_number || "N/A";
        if (record.user?.role === "teacher") return record.profile?.teacher_number || "N/A";
        return <Typography.Text type="secondary">—</Typography.Text>;
      },
    },
    {
      title: "Status",
      dataIndex: ["user", "is_active"],
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const recordId = record.user?._id || record.user?.id;
        const isActive = record.user?.is_active;

        return (
          <Space size="middle">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
              type="text" 
            />
            <Popconfirm
              title="Deactivate User Account?"
              description="Are you sure you want to flag this user as inactive? They will lose application access immediately."
              okText="Yes, Deactivate"
              okType="danger"
              cancelText="Cancel"
              onConfirm={() => {
                handleDeleteConfirmed(recordId);
              }}
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                type="text" 
                disabled={!isActive}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ], [handleEdit, handleDeleteConfirmed]);

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <Title level={3} style={{ margin: 0 }}>System User Directory</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setSelectedUser(null); setModalVisible(true); }}
        >
          Add New User
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey={(record) => record.user?._id || record.user?.user_id} 
        loading={loading}
      />

      <UserModal 
        visible={modalVisible} 
        onCancel={() => setModalVisible(false)} 
        onSuccess={() => { setModalVisible(false); fetchUsers(); }}
        editingUser={selectedUser}
      />
    </div>
  );
};

export default UserTable;