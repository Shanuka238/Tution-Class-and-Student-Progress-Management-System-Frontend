import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Popconfirm,
  message,
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../../services/adminApi";
import UserModal from "./UserModal";
import { getRoleColor } from "../../utils/roleHelper";

const { Title, Text } = Typography;
const { Option } = Select;

const UserTable = () => {
  const { token: themeToken } = theme.useToken();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter & Search states
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setData(response.data || response || []);
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

  const handleDeleteConfirmed = useCallback(
    async (userId) => {
      try {
        await adminAPI.deleteUser(userId, "soft");
        message.success("User account deactivated successfully");
        await fetchUsers();
      } catch (error) {
        message.error(error.message || "Failed to alter account status");
      }
    },
    [fetchUsers]
  );

  const resetFilters = () => {
    setSearchText("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSortBy("newest");
  };

  // Filter and sort user data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const u = item.user || {};
      const p = item.profile || {};

      // 1. Role Filter
      if (selectedRole !== "all" && u.role !== selectedRole) {
        return false;
      }

      // 2. Status Filter
      if (selectedStatus !== "all") {
        const isActiveStr = u.is_active ? "active" : "inactive";
        if (isActiveStr !== selectedStatus) return false;
      }

      // 3. Search Query Filter (Name, Email, Phone, Reference Number)
      if (searchText.trim()) {
        const query = searchText.toLowerCase().trim();
        const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        const studentNo = (p.student_number || "").toLowerCase();
        const teacherNo = (p.teacher_number || "").toLowerCase();

        const matches =
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          studentNo.includes(query) ||
          teacherNo.includes(query);

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      const uA = a.user || {};
      const uB = b.user || {};

      if (sortBy === "name_asc") {
        return (uA.first_name || "").localeCompare(uB.first_name || "");
      }
      if (sortBy === "name_desc") {
        return (uB.first_name || "").localeCompare(uA.first_name || "");
      }
      if (sortBy === "role") {
        return (uA.role || "").localeCompare(uB.role || "");
      }
      // Default: newest first
      return new Date(uB.created_at || 0) - new Date(uA.created_at || 0);
    });
  }, [data, searchText, selectedRole, selectedStatus, sortBy]);

  const columns = useMemo(
    () => [
      {
        title: "User Name",
        key: "name",
        sorter: (a, b) =>
          `${a.user?.first_name || ""} ${a.user?.last_name || ""}`.localeCompare(
            `${b.user?.first_name || ""} ${b.user?.last_name || ""}`
          ),
        render: (_, record) => (
          <Space>
            <UserOutlined style={{ color: themeToken.colorPrimary }} />
            <Text strong>
              {record.user?.first_name || ""} {record.user?.last_name || ""}
            </Text>
          </Space>
        ),
      },
      {
        title: "Email & Phone",
        key: "contact",
        render: (_, record) => (
          <div>
            <div>{record.user?.email || "—"}</div>
            {record.user?.phone && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.user.phone}
              </Text>
            )}
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: ["user", "role"],
        key: "role",
        filters: [
          { text: "Student", value: "student" },
          { text: "Teacher", value: "teacher" },
          { text: "Parent", value: "parent" },
          { text: "Admin", value: "admin" },
        ],
        onFilter: (value, record) => record.user?.role === value,
        render: (role) => <Tag color={getRoleColor(role)}>{role?.toUpperCase()}</Tag>,
      },
      {
        title: "System Ref ID",
        key: "reference",
        render: (_, record) => {
          if (record.user?.role === "student") return <Tag color="blue">{record.profile?.student_number || "N/A"}</Tag>;
          if (record.user?.role === "teacher") return <Tag color="purple">{record.profile?.teacher_number || "N/A"}</Tag>;
          return <Text type="secondary">—</Text>;
        },
      },
      {
        title: "Parent / Guardian",
        key: "parent",
        render: (_, record) => {
          if (record.user?.role === "student" && record.profile?.parent_id) {
            const parentObj = record.profile.parent_id;
            const parentUser = parentObj?.user_id || {};
            if (parentUser.first_name) {
              return (
                <Tag color="cyan">
                  {parentUser.first_name} {parentUser.last_name}
                </Tag>
              );
            }
          }
          return <Text type="secondary">—</Text>;
        },
      },
      {
        title: "Status",
        dataIndex: ["user", "is_active"],
        key: "status",
        filters: [
          { text: "Active", value: true },
          { text: "Inactive", value: false },
        ],
        onFilter: (value, record) => record.user?.is_active === value,
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
            <Space size="small">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                type="text"
              />
              <Popconfirm
                title="Deactivate User Account?"
                description="Are you sure you want to flag this user as inactive?"
                okText="Yes, Deactivate"
                okType="danger"
                cancelText="Cancel"
                onConfirm={() => handleDeleteConfirmed(recordId)}
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
    ],
    [handleEdit, handleDeleteConfirmed, themeToken.colorPrimary]
  );

  const hasActiveFilters =
    searchText || selectedRole !== "all" || selectedStatus !== "all" || sortBy !== "newest";

  return (
    <div
      style={{
        padding: "24px",
        background: themeToken.colorBgContainer,
        borderRadius: "8px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
      }}
    >
      {/* Header Title & Action Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            System User Directory
          </Title>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Total Users: {data.length} | Showing: {filteredData.length} records
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedUser(null);
            setModalVisible(true);
          }}
        >
          Add New User
        </Button>
      </div>

      {/* Advanced Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: "20px",
          background: themeToken.colorBgLayout,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          {/* Search Field */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search by Name, Email, Phone, Ref ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          {/* Role Filter */}
          <Col xs={12} sm={6} md={5} lg={4}>
            <Select
              style={{ width: "100%" }}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
            >
              <Option value="all">All Roles</Option>
              <Option value="student">Student</Option>
              <Option value="teacher">Teacher</Option>
              <Option value="parent">Parent</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Col>

          {/* Status Filter */}
          <Col xs={12} sm={6} md={5} lg={4}>
            <Select
              style={{ width: "100%" }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active Only</Option>
              <Option value="inactive">Inactive Only</Option>
            </Select>
          </Col>

          {/* Sorting */}
          <Col xs={16} sm={8} md={4} lg={5}>
            <Select
              style={{ width: "100%" }}
              value={sortBy}
              onChange={(val) => setSortBy(val)}
            >
              <Option value="newest">Newest First</Option>
              <Option value="name_asc">Name (A-Z)</Option>
              <Option value="name_desc">Name (Z-A)</Option>
              <Option value="role">Group by Role</Option>
            </Select>
          </Col>

          {/* Reset Filters */}
          <Col xs={8} sm={4} md={2} lg={3} style={{ textAlign: "right" }}>
            {hasActiveFilters && (
              <Button
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                type="text"
                danger
              >
                Reset
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* User Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record.user?._id || record.user?.user_id}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        }}
      />

      {/* Modal for User Create / Edit */}
      <UserModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchUsers();
        }}
        editingUser={selectedUser}
      />
    </div>
  );
};

export default UserTable;