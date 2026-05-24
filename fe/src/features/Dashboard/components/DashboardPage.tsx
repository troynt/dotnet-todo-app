import { useQuery } from "@connectrpc/connect-query";
import { Card, Col, Row, Statistic, Progress, List, Tag, Timeline, Spin, Button } from "antd";
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../../gen/todo-TodoService_connectquery";
import { formatTimestamp } from "../../../shared/hooks/dateHelpers";
import { Routes } from "../../../shared/routes";
import { testIds } from "../../../shared/testIds";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: statsData, isLoading } = useQuery(getDashboardStats, {});
  const stats = statsData?.stats;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Spin size="large" description="Analyzing your workspace..." />
      </div>
    );
  }

  const totalLists = stats?.totalLists ?? 0;
  const totalTasks = stats?.totalTasks ?? 0;
  const completedTasks = stats?.completedTasks ?? 0;
  const overdueTasks = stats?.overdueTasks ?? 0;
  const completionRate = stats?.completionRate ?? 0;
  const listStats = stats?.listStats ?? [];
  const upcomingTasks = stats?.upcomingTasks ?? [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DashboardOutlined style={{ fontSize: "28px", color: "#1677ff" }} />
        <div>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Dashboard Overview</h2>
          <p style={{ margin: 0, opacity: 0.6 }}>
            Real-time task analytics and metrics across all workspaces
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card variant="outlined">
            <Statistic
              title={<span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Lists</span>}
              value={totalLists}
              prefix={<ProjectOutlined style={{ color: "#1677ff", marginRight: "8px" }} />}
              valueStyle={{ fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="outlined">
            <Statistic
              title={<span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Tasks</span>}
              value={totalTasks}
              prefix={<CalendarOutlined style={{ color: "#1677ff", marginRight: "8px" }} />}
              valueStyle={{ fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="outlined">
            <div className="flex justify-between items-start">
              <Statistic
                title={<span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Completion Rate</span>}
                value={`${completionRate}%`}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a", marginRight: "8px" }} />}
                valueStyle={{ fontWeight: 800 }}
              />
              <Progress
                type="circle"
                percent={completionRate}
                size={40}
                format={() => null}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="outlined">
            <Statistic
              title={<span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Overdue Tasks</span>}
              value={overdueTasks}
              prefix={<ClockCircleOutlined style={{ color: overdueTasks > 0 ? "#ff4d4f" : "#52c41a", marginRight: "8px" }} />}
              valueStyle={{ color: overdueTasks > 0 ? "#ff4d4f" : undefined, fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Analytics Content */}
      <Row gutter={[24, 24]} className="mt-2">
        {/* Workspace List with individual progress */}
        <Col xs={24} lg={12}>
          <Card
            title="Your Workspaces"
            variant="outlined"
            className="h-full"
          >
            {listStats.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No active workspaces. Create a todo list under the Todos section!
              </div>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={listStats}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate(Routes.todoList(item.listId))}
                        data-testid={testIds.dashboardNavigateToList(item.listId)}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span style={{ fontWeight: 600, fontSize: "15px" }}>
                          {item.listName}
                        </span>
                      }
                      description={
                        <div className="flex flex-col gap-1 w-full mt-1.5">
                          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {item.listDescription || "No description provided"}
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <Progress
                              percent={item.percentComplete}
                              size="small"
                              style={{ flex: 1, margin: 0 }}
                            />
                            <span style={{ fontSize: "12px", color: "#8c8c8c", fontWeight: 600, minWidth: "fit-content" }}>
                              {item.completedTasks}/{item.totalTasks} tasks
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Timeline of Upcoming Tasks */}
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Schedule"
            variant="outlined"
            className="h-full"
          >
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No scheduled tasks. Add due dates to your tasks to track them here!
              </div>
            ) : (
              <Timeline mode="left" style={{ marginTop: "16px" }}>
                {upcomingTasks.map((task) => (
                  <Timeline.Item
                    key={task.id}
                    dot={<ClockCircleOutlined style={{ fontSize: "14px" }} />}
                    color={
                      task.status === "overdue" ? "red" : task.status === "today" ? "orange" : "green"
                    }
                  >
                    <div className="flex flex-col gap-0.5 mb-4">
                      <div className="flex items-center justify-between gap-2">
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>
                          {task.title}
                        </span>
                        <Tag color={
                          task.status === "overdue" ? "error" : task.status === "today" ? "warning" : "success"
                        }>
                          Due {formatTimestamp(task.dueAt)}
                        </Tag>
                      </div>
                      {task.listName && (
                        <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
                          {task.listName}
                        </span>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
