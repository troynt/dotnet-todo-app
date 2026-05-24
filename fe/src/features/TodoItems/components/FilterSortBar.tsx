import { Radio, Select, Space, Typography } from "antd";
import { testIds } from "../../../shared/testIds";

const { Text } = Typography;

interface FilterSortBarProps {
  filter: "all" | "active" | "completed";
  setFilter: (filter: "all" | "active" | "completed") => void;
  sortBy: "created" | "due" | "title";
  setSortBy: (sortBy: "created" | "due" | "title") => void;
}

export function FilterSortBar({ filter, setFilter, sortBy, setSortBy }: FilterSortBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-gray-100 select-none">
      {/* Status Filter */}
      <Radio.Group
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        optionType="button"
        buttonStyle="solid"
      >
        <Radio.Button value="all" data-testid={testIds.filterAllRadio}>All</Radio.Button>
        <Radio.Button value="active" data-testid={testIds.filterActiveRadio}>Active</Radio.Button>
        <Radio.Button value="completed" data-testid={testIds.filterCompletedRadio}>Completed</Radio.Button>
      </Radio.Group>

      {/* Sort selector */}
      <Space size="middle">
        <Text type="secondary" style={{ fontSize: "12px" }}>
          Sort by
        </Text>
        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          style={{ width: 130 }}
          options={[
            { value: "created", label: "Date Created" },
            { value: "due", label: "Due Date" },
            { value: "title", label: "Title" },
          ]}
          data-testid={testIds.sortBySelect}
        />
      </Space>
    </div>
  );
}

export default FilterSortBar;
