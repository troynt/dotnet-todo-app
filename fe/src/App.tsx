import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, ConfigProvider, theme } from "antd";
import {
  DashboardOutlined,
  CheckSquareOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { DashboardPage } from "./features/Dashboard/components/DashboardPage";
import { TodosPage } from "./features/TodoItems/components/TodosPage";
import { SettingsPage } from "./features/Settings/components/SettingsPage";
import { Routes as routePaths } from "./shared/routes";
import "./index.css";

const { Sider, Content } = Layout;

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Determine active menu item from pathname
  const getSelectedKey = () => {
    const path = location.pathname;
    if (routePaths.isDashboard(path)) return "dashboard";
    if (routePaths.isTodos(path)) return "todos";
    if (routePaths.isSettings(path)) return "settings";
    return "todos";
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate(routePaths.dashboard),
    },
    {
      key: "todos",
      icon: <CheckSquareOutlined />,
      label: "Todos",
      onClick: () => navigate(routePaths.todos),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate(routePaths.settings),
    },
  ];

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Global Sidebar Sider */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="md"
        >
          <div className="flex flex-col h-full py-4 justify-between">
            <div>
              {/* Logo / Brand */}
              <div className="flex items-center justify-center py-6 px-4 overflow-hidden select-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold bg-[#1677ff] text-white">
                    T
                  </div>
                  {!collapsed && (
                    <span className="font-extrabold text-lg text-white tracking-tight">
                      TodoSphere
                    </span>
                  )}
                </div>
              </div>

              {/* Main Navigation Menu */}
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[getSelectedKey()]}
                items={menuItems}
                style={{ background: "transparent", border: "none" }}
              />
            </div>
            {!collapsed && (
              <div className="px-4 text-center text-[10px] text-white/30 select-none">
                v0.1.0 • AntD
              </div>
            )}
          </div>
        </Sider>

        {/* Main Content Layout */}
        <Layout>
          <Content style={{ overflowY: "auto", height: "100vh" }} className="w-full">
            <Routes>
              <Route path="/" element={<Navigate to={routePaths.todos} replace />} />
              <Route path={routePaths.dashboard} element={<DashboardPage />} />
              <Route path={routePaths.todos} element={<TodosPage />} />
              <Route path="/todos/:listId" element={<TodosPage />} />
              <Route path={routePaths.settings} element={<SettingsPage />} />
              <Route path="*" element={<Navigate to={routePaths.todos} replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
