import { Checkbox, Button, Tag, Space, Typography, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import type { TodoItem as TodoItemType } from "../../../gen/todo_pb";
import { getDueDateStatus, formatTimestamp } from "../../../shared/hooks/dateHelpers";
import { testIds } from "../../../shared/testIds";

const { Text } = Typography;

interface TodoItemProps {
  item: TodoItemType;
  onToggleItem: (item: TodoItemType) => void;
  onStartEdit: (item: TodoItemType) => void;
  onDeleteItem: (itemId: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
  isNew?: boolean;
}

export function TodoItem({ item, onToggleItem, onStartEdit, onDeleteItem, isToggling, isDeleting, isNew }: TodoItemProps) {
  const dueStatus = getDueDateStatus(item.dueAt);

  const getTagColor = () => {
    if (dueStatus === "overdue") return "error";
    if (dueStatus === "today") return "warning";
    return "success";
  };

  const highlightStyle: React.CSSProperties = isNew
    ? { backgroundColor: "rgba(59, 130, 246, 0.2)", animation: "highlight-fade 2.5s ease-out forwards" }
    : undefined;

  return (
    <div
      data-testid={`todo-item-row-${item.id}`}
      className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100/70 border border-gray-100 transition-all duration-200"
      style={{ ...highlightStyle, opacity: item.isCompleted ? 0.6 : undefined }}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Ant Design Checkbox */}
        <Checkbox
          checked={item.isCompleted}
          onChange={() => onToggleItem(item)}
          className="mt-1"
          disabled={isToggling || item.isCompleted}
          data-testid={testIds.todoItemCheckbox(item.id)}
        />

        {/* Title and Description */}
        <div className="flex flex-col gap-0.5 min-w-0 pr-3 select-none">
          <Text
            data-testid={testIds.todoItemTitle(item.id)}
            strong
            delete={item.isCompleted}
            style={{ fontSize: "15px" }}
            className="truncate transition-all duration-200"
          >
            {item.title}
          </Text>
          {item.description && (
            <Text
              data-testid={testIds.todoItemDescription(item.id)}
              type="secondary"
              style={{ fontSize: "12px" }}
              className="truncate mt-0.5"
            >
              {item.description}
            </Text>
          )}
        </div>
      </div>

      {/* Info / Metadata Badges & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Due Date Indicator */}
        {item.dueAt && !item.isCompleted && (
          <Tag icon={<CalendarOutlined />} color={getTagColor()} className="border-none px-2.5 py-0.5 rounded-lg select-none font-bold uppercase tracking-wider text-[10px]">
            {formatTimestamp(item.dueAt)}
          </Tag>
        )}

        {/* Action buttons */}
        <Space className="opacity-0 group-hover:opacity-100 transition-all duration-200" size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onStartEdit(item)}
            size="small"
            title="Edit Task"
            data-testid={testIds.todoItemEditButton(item.id)}
            className="text-gray-400 hover:text-gray-600"
          />
          <Popconfirm
            title="Delete Task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => onDeleteItem(item.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, ["data-testid"]: testIds.todoItemConfirmDeleteButton(item.id) }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Delete Task"
              data-testid={testIds.todoItemDeleteButton(item.id)}
              onClick={(e) => e.stopPropagation()}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500"
            />
          </Popconfirm>
        </Space>
      </div>
    </div>
  );
}

export default TodoItem;
