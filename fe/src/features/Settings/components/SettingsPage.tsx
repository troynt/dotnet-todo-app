import { useState } from "react";
import { Card, Form, Input, Button, Switch, Space, Typography, message, Avatar, Row, Col } from "antd";
import { SettingOutlined, UserOutlined, BellOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { testIds } from "../../../shared/testIds";

const { Title, Text, Paragraph } = Typography;

export function SettingsPage() {
  const [profileForm] = Form.useForm();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [denseMode, setDenseMode] = useState(false);

  const handleSaveProfile = (values: any) => {
    message.success(`Profile updated successfully! Welcome, ${values.username || "User"}.`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingOutlined style={{ fontSize: "28px", color: "#1677ff" }} />
        <div>
          <Title level={2} style={{ margin: 0 }}>Application Settings</Title>
          <Paragraph style={{ margin: 0, opacity: 0.6 }}>
            Customize your task manager experience, themes, and profile options
          </Paragraph>
        </div>
      </div>

      <Row gutter={[24, 24]} className="mt-2">
        <Col xs={24} md={12}>
          {/* Notifications */}
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: "#1677ff" }} />
                <span>Notifications</span>
              </Space>
            }
            bordered={true}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <Text strong style={{ display: "block" }}>Email Notifications</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Daily summary of upcoming and overdue tasks
                  </Text>
                </div>
                <Switch checked={emailNotifications} onChange={setEmailNotifications} data-testid={testIds.settingsEmailNotificationsSwitch} />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Text strong style={{ display: "block" }}>Browser Push Notifications</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Alerts on task deadlines in active window
                  </Text>
                </div>
                <Switch checked={pushNotifications} onChange={setPushNotifications} data-testid={testIds.settingsPushNotificationsSwitch} />
              </div>
            </div>
          </Card>

          {/* Workspace Settings */}
          <Card
            title="Preferences"
            bordered={true}
            className="mt-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <Text strong style={{ display: "block" }}>Dense Workspace Layout</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Compact lists and smaller font padding
                </Text>
              </div>
              <Switch checked={denseMode} onChange={setDenseMode} data-testid={testIds.settingsDenseModeSwitch} />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          {/* Profile Mock Settings */}
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: "#1677ff" }} />
                <span>User Profile</span>
              </Space>
            }
            bordered={true}
          >
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar size={72} icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
              <div>
                <Text strong style={{ fontSize: "16px", display: "block", textAlign: "center" }}>
                  Dev User
                </Text>
                <Text type="secondary" style={{ fontSize: "12px", textAlign: "center", display: "block" }}>
                  Primary Workspace Owner
                </Text>
              </div>
            </div>

            <Form
              layout="vertical"
              form={profileForm}
              onFinish={handleSaveProfile}
              initialValues={{ username: "Dev User", email: "dev@todosphere.io" }}
            >
              <Form.Item
                label="Display Name"
                name="username"
                rules={[{ required: true, message: "Please input display name!" }]}
              >
                <Input data-testid={testIds.settingsDisplayNameInput} />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, type: "email", message: "Please input valid email!" }]}
              >
                <Input data-testid={testIds.settingsEmailInput} />
              </Form.Item>

              <Form.Item style={{ margin: "24px 0 0 0" }}>
                <Button type="primary" htmlType="submit" block style={{ height: "40px", fontWeight: "bold" }} data-testid={testIds.settingsSaveProfileButton}>
                  Save Profile Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* System Info */}
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1677ff" }} />
                <span>System & Account</span>
              </Space>
            }
            bordered={true}
            className="mt-6"
          >
            <div className="flex flex-col gap-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="font-bold text-gray-800">SQLite v3 (Local)</span>
              </div>
              <div className="flex justify-between">
                <span>Backend Framework:</span>
                <span className="font-bold text-gray-800">ASP.NET Core gRPC (.NET 10)</span>
              </div>
              <div className="flex justify-between">
                <span>Frontend Bundler:</span>
                <span className="font-bold text-gray-800">Bun + React 19</span>
              </div>
              <div className="flex justify-between">
                <span>Orchestrator:</span>
                <span className="font-bold text-gray-800">.NET Aspire</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SettingsPage;
