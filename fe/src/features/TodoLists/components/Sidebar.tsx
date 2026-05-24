import { useState } from "react";
import { Spin, Button, Typography, Modal, Form, Input, Popconfirm, Space } from "antd";
import { PlusOutlined, DeleteOutlined, FolderOutlined, FolderOpenOutlined } from "@ant-design/icons";
import type { TodoList } from "../../../gen/todo_pb";
import { testIds } from "../../../shared/testIds";

const { Title } = Typography;

interface SidebarProps {
  lists: TodoList[];
  selectedListId: string | undefined;
  loading: boolean;
  setSelectedListId: (id: string | undefined) => void;
  onCreateList: (vars: { name: string; description: string }) => void;
  onDeleteList: (listId: string) => void;
}

export function Sidebar({
  lists,
  selectedListId,
  loading,
  setSelectedListId,
  onCreateList,
  onDeleteList,
}: SidebarProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreateList = () => {
    form.validateFields().then((values) => {
      onCreateList({ name: values.name, description: values.description || "" });
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  return (
    <div className="w-full md:w-80 flex flex-col gap-4 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm shrink-0">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
          Workspaces
        </Title>
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          title="Create New List"
          size="small"
          data-testid={testIds.sidebarCreateListButton}
        />
      </div>

      {/* Lists Container */}
      <div className="flex flex-col overflow-y-auto max-h-[50vh] pr-1 mt-2">
        {loading ? (
          <div className="text-center py-6">
            <Spin />
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-xs">No workspaces. Create one above!</div>
        ) : (
          lists.map((list) => {
            const isActive = selectedListId === list.id;
            return (
              <div
                key={list.id}
                data-testid={testIds.sidebarListItem(list.id)}
                onClick={() => setSelectedListId(list.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border mb-2 ${
                  isActive
                    ? "bg-[#e6f4ff] border-[#91caff] text-[#1677ff] font-bold"
                    : "bg-transparent border-transparent hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
              >
                <Space align="center" className="min-w-0 flex-1 pr-2">
                  {isActive ? (
                    <FolderOpenOutlined style={{ color: "#1677ff", fontSize: "16px" }} className="shrink-0" />
                  ) : (
                    <FolderOutlined style={{ color: "#bfbfbf", fontSize: "16px" }} className="shrink-0" />
                  )}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate text-sm">{list.name}</span>
                    {list.description && (
                      <span className="text-[10px] text-gray-400 truncate font-normal">
                        {list.description}
                      </span>
                    )}
                  </div>
                </Space>

                <Popconfirm
                  title="Delete Workspace"
                  description="Delete list and all its tasks?"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    onDeleteList(list.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true, ['data-testid']: testIds.sidebarConfirmDeleteListButton(list.id) }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={testIds.sidebarDeleteListButton(list.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                  />
                </Popconfirm>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for list creation */}
      <Modal
        title="Create New Workspace"
        open={isModalVisible}
        onOk={handleCreateList}
        onCancel={() => setIsModalVisible(false)}
        okText="Create"
        cancelText="Cancel"
        destroyOnHidden
        okButtonProps={{ "data-testid": testIds.modalCreateListSubmitButton }}
        cancelButtonProps={{ "data-testid": testIds.modalCreateListCancelButton }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Workspace Name"
            rules={[{ required: true, message: "Please input workspace name!" }]}
          >
            <Input placeholder="e.g. Shopping, Personal, Work" maxLength={40} data-testid={testIds.modalCreateListNameInput} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea placeholder="Describe the purpose of this workspace..." rows={3} maxLength={100} data-testid={testIds.modalCreateListDescriptionInput} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Sidebar;
