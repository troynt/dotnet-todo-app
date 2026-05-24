import { Typography, Progress } from "antd";
import type { TodoList } from "../../../gen/todo_pb";
import { testIds } from "../../../shared/testIds";

const { Title, Paragraph } = Typography;

interface ListHeaderProps {
  activeList: TodoList;
  totalCount: number;
  completedCount: number;
  progressPercent: number;
}

export function ListHeader({
  activeList,
  totalCount,
  completedCount,
  progressPercent,
}: ListHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
      <div className="min-w-0">
        <Title level={2} data-testid={testIds.todoListHeaderTitle} style={{ margin: 0, fontWeight: 900 }} className="truncate">
          {activeList.name}
        </Title>
        {activeList.description && (
          <Paragraph style={{ margin: "4px 0 0 0", opacity: 0.6 }} className="text-sm">
            {activeList.description}
          </Paragraph>
        )}
      </div>

      {/* Progress Tracker */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 shrink-0 self-start md:self-auto">
          <div className="flex flex-col gap-0.5 text-right select-none">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Progress</span>
            <span data-testid={testIds.todoListProgress} className="text-xs font-bold text-gray-700">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <Progress
            type="circle"
            percent={progressPercent}
            size={44}
            strokeWidth={10}
            railColor="#f0f0f0"
          />
        </div>
      )}
    </div>
  );
}
export default ListHeader;
