import { useEffect } from "react";
import { Drawer, Form, Input, DatePicker, Button, Space } from "antd";
import type { TodoItem } from "../../../gen/todo_pb";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import dayjs from "dayjs";
import { testIds } from "../../../shared/testIds";

interface EditDrawerProps {
  item: TodoItem;
  onSave: (vars: { title: string; description: string; dueAtStr: string }) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export function EditDrawer({ item, onSave, onCancel, isUpdating }: EditDrawerProps) {
  const [form] = Form.useForm();

  // Reset form values when item changes
  useEffect(() => {
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      dueAt: item.dueAt ? dayjs(timestampDate(item.dueAt)) : null,
    });
  }, [item, form]);

  const handleSubmit = (values: any) => {
    const dueAtStr = values.dueAt ? values.dueAt.toISOString() : "";
    onSave({
      title: values.title,
      description: values.description || "",
      dueAtStr,
    });
  };

  return (
    <Drawer
      title={
        <span data-testid={testIds.editDrawerHeading}>
          Edit Task Details
        </span>
      }
      placement="right"
      onClose={onCancel}
      open={true}
      size={400}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: item.title,
          description: item.description,
          dueAt: item.dueAt ? dayjs(timestampDate(item.dueAt)) : null,
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Task title is required" }]}
        >
          <Input size="large" data-testid={testIds.editDrawerTitleInput} />
        </Form.Item>

        <Form.Item
          name="dueAt"
          label="Due Date & Time"
        >
          <DatePicker showTime size="large" style={{ width: "100%" }} data-testid={testIds.editDrawerDueDatePicker} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={5} placeholder="Task description..." data-testid={testIds.editDrawerDescriptionInput} />
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onCancel} size="large" data-testid={testIds.editDrawerCancelButton}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ fontWeight: "bold" }}
              loading={isUpdating}
              disabled={isUpdating}
              data-testid={testIds.editDrawerSaveButton}
            >
              Save Changes
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default EditDrawer;
