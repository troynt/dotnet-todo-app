import { Form, Input, DatePicker, Button, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { testIds } from "../../../shared/testIds";

interface AddItemFormProps {
  onAddItem: (vars: { title: string; description: string; dueAtStr: string }) => void;
  isCreating: boolean;
}

export function AddItemForm({ onAddItem, isCreating }: AddItemFormProps) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const dueAtStr = values.dueAt ? values.dueAt.toISOString() : "";
    onAddItem({
      title: values.title,
      description: values.description || "",
      dueAtStr,
    });
    form.resetFields();
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3"
    >
      <Row gutter={12}>
        <Col xs={24} sm={16}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Task title is required" }]}
            style={{ margin: 0 }}
          >
            <Input placeholder="Task title..." size="large" data-testid={testIds.addItemTitleInput} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="dueAt" style={{ margin: 0 }}>
            <DatePicker
              showTime
              placeholder="Due date & time"
              size="large"
              style={{ width: "100%" }}
              disabledDate={(current) => current && current < dayjs().startOf("day")}
              data-testid={testIds.addItemDueDatePicker}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="flex items-center gap-3">
        <Form.Item name="description" style={{ margin: 0, flex: 1 }}>
          <Input placeholder="Task description (optional)..." size="middle" data-testid={testIds.addItemDescriptionInput} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
          size="middle"
          loading={isCreating}
          disabled={isCreating}
          style={{ fontWeight: "bold" }}
          data-testid={testIds.addItemSubmitButton}
        >
          Add Task
        </Button>
      </div>
    </Form>
  );
}

export default AddItemForm;
