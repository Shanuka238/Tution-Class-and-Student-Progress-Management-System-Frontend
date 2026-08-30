import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Spin, Space, Empty, message } from "antd";
import {
  RiseOutlined,
  CheckSquareOutlined,
  TrophyOutlined,
  BookOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { parentAPI } from "../../services/parentApi";
import { feeAPI } from "../../services/feeApi";
import StatCard from "../Common/StatCard";

import dayjs from "dayjs";
import ParentHeaderBanner from "./ParentHeaderBanner";
import GrowthHighlightsBanner from "./GrowthHighlightsBanner";
import SubjectCompetencyCards from "./SubjectCompetencyCards";
import ChildScheduleCard from "./ChildScheduleCard";
import ChildFeeStandingCard from "./ChildFeeStandingCard";
import AttendanceAnalyticsCard from "./AttendanceAnalyticsCard";
import ChildProgressView from "./ChildProgressView";
import ParentAnalyticsView from "./ParentAnalyticsView";
import StudentAttendance from "../StudentDashboard/StudentAttendance";
import StudentResults from "../ExamManagement/StudentResults";
import PaymentTable from "../PaymentManagement/PaymentTable";
import { launchPayHereCheckout } from "../../utils/paymentUtils";
import { calculateGrowthMetrics, getGrowthBadge } from "../../utils/academicUtils";

function ParentDashboardOverview({ activeTab = "overview" }) {
  const { user } = useAuth();
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [payingFeeId, setPayingFeeId] = useState(null);

  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [progressData, setProgressData] = useState(null);

  const loadLinkedChildren = useCallback(async () => {
    setLoadingChildren(true);
    try {
      const res = await parentAPI.getMyChildren();
      const list = res.data || res;
      const childrenArr = Array.isArray(list) ? list : [];
      setChildren(childrenArr);
      if (childrenArr.length > 0) {
        setSelectedStudentId(childrenArr[0].student_id || childrenArr[0]._id);
      }
    } catch (err) {
      console.error("Error loading parent's children:", err);
      message.error("Failed to load linked student records");
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    loadLinkedChildren();
  }, [loadLinkedChildren]);

  const loadChildProgress = useCallback(async (studentId) => {
    if (!studentId) return;
    setLoadingProgress(true);
    try {
      const res = await parentAPI.getChildProgress(studentId);
      const data = res.data || res;
      setProgressData(data);
    } catch (err) {
      console.error("Error loading child progress:", err);
      setProgressData(null);
    } finally {
      setLoadingProgress(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadChildProgress(selectedStudentId);
    }
  }, [selectedStudentId, loadChildProgress]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const returnedFeeId = urlParams.get("fee_id");

    if (paymentStatus === "success" && returnedFeeId) {
      const confirmPaymentLocally = async () => {
        try {
          await feeAPI.mockPayHereSuccess(returnedFeeId);
          message.success("Online tuition payment verified successfully!");
          if (selectedStudentId) {
            loadChildProgress(selectedStudentId);
          }
        } catch (err) {
          console.error("Payment synchronization failure:", err);
          message.error("Failed to automatically synchronize payment record");
        }
      };
      confirmPaymentLocally();

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [selectedStudentId, loadChildProgress]);

  const handleInitiatePayHere = async (feeRecordOrId) => {
    const targetFeeId =
      typeof feeRecordOrId === "object"
        ? feeRecordOrId._id || feeRecordOrId.fee_id || feeRecordOrId.id
        : feeRecordOrId;
    if (!targetFeeId) return;

    setPayingFeeId(targetFeeId);
    try {
      const res = await feeAPI.initiatePayHere(targetFeeId);
      launchPayHereCheckout(res.data || res, user);
    } catch (err) {
      console.error("Error initiating PayHere checkout:", err);
      message.error(err.message || "Failed to launch PayHere payment gateway");
    } finally {
      setPayingFeeId(null);
    }
  };

  const selectedChild = children.find(
    (c) => (c.student_id || c._id) === selectedStudentId
  );
  const childUser = selectedChild?.user_id || {};

  const attendanceLogs = progressData?.attendance || [];
  const enrolledClasses = progressData?.classes || [];
  const feeInvoices = progressData?.fees || [];
  const examResults = progressData?.results || [];
  const timetableSessions = progressData?.timetable || [];

  const {
    presentCount,
    lateCount,
    absentCount,
    attendancePct,
    unpaidFees,
    totalUnpaidAmount,
    avgExamScore,
    growthIndex,
  } = calculateGrowthMetrics(attendanceLogs, examResults, feeInvoices);

  const growthBadge = getGrowthBadge(growthIndex);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const todaySessions = timetableSessions.filter(
    (s) => dayjs(s.date).format("YYYY-MM-DD") === todayStr
  );

  const statCardsData = [
    {
      title: "Academic Growth Index",
      value: `${growthIndex}%`,
      icon: <RiseOutlined />,
      color: growthBadge.color,
    },
    {
      title: "Attendance Rate",
      value: attendanceLogs.length > 0 ? `${attendancePct}%` : "—",
      icon: <CheckSquareOutlined />,
      color: attendanceLogs.length > 0 ? (attendancePct >= 80 ? "#10B981" : "#F59E0B") : "#94A3B8",
    },
    {
      title: "Average Exam Score",
      value: examResults.length > 0 ? `${avgExamScore}%` : "—",
      icon: <TrophyOutlined />,
      color: examResults.length > 0 ? "#8B5CF6" : "#94A3B8",
    },
    {
      title: "Enrolled Subjects",
      value: enrolledClasses.length > 0 ? enrolledClasses.length.toString() : "—",
      icon: <BookOutlined />,
      color: "#3B82F6",
    },
    {
      title: "Outstanding Fees",
      value:
        feeInvoices.length === 0
          ? "—"
          : unpaidFees.length > 0
          ? `LKR ${totalUnpaidAmount.toLocaleString()}`
          : "Cleared",
      icon: <DollarOutlined />,
      color: feeInvoices.length === 0 ? "#94A3B8" : unpaidFees.length > 0 ? "#EF4444" : "#10B981",
    },
  ];

  const headerBannerComp = (
    <ParentHeaderBanner
      user={user}
      selectedChild={selectedChild}
      children={children}
      selectedStudentId={selectedStudentId}
      setSelectedStudentId={setSelectedStudentId}
      loadingChildren={loadingChildren}
      growthBadge={growthBadge}
    />
  );

  if (activeTab === "attendance") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {headerBannerComp}
        <StudentAttendance attendance={attendanceLogs} loading={loadingProgress} />
      </div>
    );
  }

  if (activeTab === "exams") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {headerBannerComp}
        <StudentResults results={examResults} loading={loadingProgress} />
      </div>
    );
  }

  if (activeTab === "payments") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {headerBannerComp}
        <PaymentTable
          fees={feeInvoices}
          loading={loadingProgress}
          onPay={handleInitiatePayHere}
        />
      </div>
    );
  }

  if (activeTab === "progress") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {headerBannerComp}
        <ChildProgressView
          childUser={childUser}
          growthBadge={growthBadge}
          growthIndex={growthIndex}
          attendancePct={attendancePct}
          avgExamScore={avgExamScore}
          enrolledClasses={enrolledClasses}
          attendanceLogs={attendanceLogs}
          examResults={examResults}
        />
      </div>
    );
  }

  if (activeTab === "analytics") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {headerBannerComp}
        <ParentAnalyticsView examResults={examResults} />
      </div>
    );
  }

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {headerBannerComp}

      <div className="stats-row">
        {statCardsData.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {loadingProgress ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : selectedChild ? (
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={15}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <GrowthHighlightsBanner
                childUser={childUser}
                growthBadge={growthBadge}
                attendancePct={attendancePct}
                presentCount={presentCount}
                scoredExams={examResults}
                avgExamScore={avgExamScore}
                unpaidFees={unpaidFees}
              />

              <SubjectCompetencyCards
                enrolledClasses={enrolledClasses}
                attendanceLogs={attendanceLogs}
                examResults={examResults}
              />

              <ChildScheduleCard
                childUser={childUser}
                todaySessions={todaySessions}
              />
            </Space>
          </Col>

          <Col xs={24} lg={9}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <ChildFeeStandingCard
                childUser={childUser}
                unpaidFees={unpaidFees}
                totalUnpaidAmount={totalUnpaidAmount}
                payingFeeId={payingFeeId}
                handleInitiatePayHere={handleInitiatePayHere}
              />

              <AttendanceAnalyticsCard
                attendancePct={attendancePct}
                presentCount={presentCount}
                lateCount={lateCount}
                absentCount={absentCount}
              />
            </Space>
          </Col>
        </Row>
      ) : (
        <Card style={{ borderRadius: "14px" }}>
          <Empty description="No linked children found for your parent account." />
        </Card>
      )}
    </div>
  );
}

export default ParentDashboardOverview;
