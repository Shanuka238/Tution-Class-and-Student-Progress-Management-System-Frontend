import React from "react";
import { notification, message as antdMessage } from "antd";
import { CheckOutlined, ExclamationOutlined, InfoOutlined, WarningOutlined, CloseOutlined } from "@ant-design/icons";

const parseToastParams = (param1, param2) => {
  if (typeof param1 === "object" && param1 !== null) {
    return {
      title: param1.title || param1.content || param1.message || "Notification",
      description: param1.description || param1.detail || "",
    };
  }
  if (typeof param1 === "string" && param2) {
    return { title: param1, description: String(param2) };
  }
  return { title: String(param1 || ""), description: "" };
};

/**
 * Custom Toast Notification Helper matching the exact pastel card pill design
 */
export const toast = {
  success: (param1, param2) => {
    const { title, description } = parseToastParams(param1, param2);
    const key = `toast_${Date.now()}_${Math.random()}`;
    notification.open({
      key,
      placement: "top",
      duration: 4.5,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: 0,
        border: "none",
      },
      closeIcon: null,
      description: null,
      message: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#BBF7D0",
            color: "#064E3B",
            border: "1px solid #86EFAC",
            borderRadius: "22px",
            padding: "14px 20px",
            boxShadow: "0 16px 36px -6px rgba(15, 23, 42, 0.22)",
            minWidth: "320px",
            maxWidth: "460px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                color: "#16A34A",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              <CheckOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#064E3B", lineHeight: 1.3 }}>{title}</div>
              {description ? (
                <div style={{ fontSize: "13px", color: "#166534", marginTop: "3px", lineHeight: 1.35, fontWeight: 400 }}>{description}</div>
              ) : null}
            </div>
          </div>
          <CloseOutlined
            style={{ color: "#15803D", cursor: "pointer", fontSize: "14px", marginLeft: "14px" }}
            onClick={() => notification.destroy(key)}
          />
        </div>
      ),
    });
  },

  error: (param1, param2) => {
    const { title, description } = parseToastParams(param1, param2);
    const key = `toast_${Date.now()}_${Math.random()}`;
    notification.open({
      key,
      placement: "top",
      duration: 5,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: 0,
        border: "none",
      },
      closeIcon: null,
      description: null,
      message: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FECDD3",
            color: "#881337",
            border: "1px solid #FDA4AF",
            borderRadius: "22px",
            padding: "14px 20px",
            boxShadow: "0 16px 36px -6px rgba(15, 23, 42, 0.22)",
            minWidth: "320px",
            maxWidth: "460px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                color: "#DC2626",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              <ExclamationOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#881337", lineHeight: 1.3 }}>{title}</div>
              {description ? (
                <div style={{ fontSize: "13px", color: "#9F1239", marginTop: "3px", lineHeight: 1.35, fontWeight: 400 }}>{description}</div>
              ) : null}
            </div>
          </div>
          <CloseOutlined
            style={{ color: "#BE123C", cursor: "pointer", fontSize: "14px", marginLeft: "14px" }}
            onClick={() => notification.destroy(key)}
          />
        </div>
      ),
    });
  },

  info: (param1, param2) => {
    const { title, description } = parseToastParams(param1, param2);
    const key = `toast_${Date.now()}_${Math.random()}`;
    notification.open({
      key,
      placement: "top",
      duration: 4.5,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: 0,
        border: "none",
      },
      closeIcon: null,
      description: null,
      message: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#C7D2FE",
            color: "#1E1B4B",
            border: "1px solid #A5B4FC",
            borderRadius: "22px",
            padding: "14px 20px",
            boxShadow: "0 16px 36px -6px rgba(15, 23, 42, 0.22)",
            minWidth: "320px",
            maxWidth: "460px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                color: "#4F46E5",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              <InfoOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#1E1B4B", lineHeight: 1.3 }}>{title}</div>
              {description ? (
                <div style={{ fontSize: "13px", color: "#3730A3", marginTop: "3px", lineHeight: 1.35, fontWeight: 400 }}>{description}</div>
              ) : null}
            </div>
          </div>
          <CloseOutlined
            style={{ color: "#4338CA", cursor: "pointer", fontSize: "14px", marginLeft: "14px" }}
            onClick={() => notification.destroy(key)}
          />
        </div>
      ),
    });
  },

  warning: (param1, param2) => {
    const { title, description } = parseToastParams(param1, param2);
    const key = `toast_${Date.now()}_${Math.random()}`;
    notification.open({
      key,
      placement: "top",
      duration: 4.5,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: 0,
        border: "none",
      },
      closeIcon: null,
      description: null,
      message: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FDE68A",
            color: "#78350F",
            border: "1px solid #FCD34D",
            borderRadius: "22px",
            padding: "14px 20px",
            boxShadow: "0 16px 36px -6px rgba(15, 23, 42, 0.22)",
            minWidth: "320px",
            maxWidth: "460px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                color: "#D97706",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              <WarningOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#78350F", lineHeight: 1.3 }}>{title}</div>
              {description ? (
                <div style={{ fontSize: "13px", color: "#92400E", marginTop: "3px", lineHeight: 1.35, fontWeight: 400 }}>{description}</div>
              ) : null}
            </div>
          </div>
          <CloseOutlined
            style={{ color: "#B45309", cursor: "pointer", fontSize: "14px", marginLeft: "14px" }}
            onClick={() => notification.destroy(key)}
          />
        </div>
      ),
    });
  },
};

// Global Bridge: Overrides Antd message.xxx calls to use custom pastel toast across all features!
try {
  antdMessage.success = (content, duration) => toast.success(content);
  antdMessage.error = (content, duration) => toast.error(content);
  antdMessage.info = (content, duration) => toast.info(content);
  antdMessage.warning = (content, duration) => toast.warning(content);
} catch (e) {
  console.warn("Could not bind message bridge:", e);
}
