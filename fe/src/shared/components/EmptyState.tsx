import { Empty, Typography } from "antd";
import { FolderOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
      <Empty
        image={<FolderOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />}
        description={
          <div className="mt-2">
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              No Active Workspace
            </Title>
            <Paragraph style={{ margin: "4px 0 0 0", fontSize: "13px" }} type="secondary">
              Please select a workspace from the sidebar or create a new one to begin tracking tasks.
            </Paragraph>
          </div>
        }
      />
    </div>
  );
}

export default EmptyState;
