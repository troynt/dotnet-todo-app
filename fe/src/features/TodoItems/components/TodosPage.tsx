import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../../TodoLists/components/Sidebar";
import { ListHeader } from "../../TodoLists/components/ListHeader";
import { useTodoLists } from "../../TodoLists/hooks/useTodoLists";
import { AddItemForm } from "./AddItemForm";
import { FilterSortBar } from "./FilterSortBar";
import { TodoItem } from "./TodoItem";
import { EditDrawer } from "./EditDrawer";
import { useTodoItems } from "../hooks/useTodoItems";
import { EmptyState } from "../../../shared/components/EmptyState";
import { testIds } from "../../../shared/testIds";
import { Routes } from "../../../shared/routes";
import { first } from "lodash-es"

export function TodosPage() {
  const { listId } = useParams<{ listId?: string }>();
  const navigate = useNavigate();

  const {
    lists,
    loading: listsLoading,
    handleCreateList,
    handleDeleteList,
    isCreating: isCreatingList,
    isDeleting: isDeletingList,
  } = useTodoLists({
    onListCreated: (newId) => navigate(Routes.todoList(newId)),
    onListDeleted: (deletedId, remaining) => {
      const found = first(remaining);
      if (found) {
        navigate(Routes.todoList(found.id));
      } else {
        navigate(Routes.todos);
      }
    },
  });

  const {
    items,
    loading: itemsLoading,
    editingItem,
    setEditingItem,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    totalCount,
    completedCount,
    progressPercent,
    filteredItems,
    handleCreateItem,
    handleToggleItem,
    handleDeleteItem,
    handleUpdateItem,
    isCreating,
    isToggling,
    isDeleting,
    isUpdating,
    isNewItem,
  } = useTodoItems(listId);

  // Auto-select first list on load if no list is currently active in the URL
  useEffect(() => {
      if (lists.length > 0 && !listId) {
        navigate(Routes.todoList(lists[0]!.id), { replace: true });
    }
  }, [lists, listId, navigate]);

  const activeList = lists.find((l) => l.id === listId);
  const loading = listsLoading || itemsLoading;

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 p-4 md:p-8 min-h-[85vh] max-w-6xl mx-auto">
      {/* Sidebar: Todo Lists */}
      <Sidebar
        lists={lists}
        selectedListId={listId}
        loading={listsLoading}
        setSelectedListId={(id) => navigate(id ? Routes.todoList(id) : Routes.todos)}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
        isCreating={isCreatingList}
        isDeleting={isDeletingList}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm">
        {activeList ? (
          <>
            {/* List Details & Progress */}
            <ListHeader
              activeList={activeList}
              totalCount={totalCount}
              completedCount={completedCount}
              progressPercent={progressPercent}
            />

            {/* Quick Add Todo Item Form */}
            <AddItemForm onAddItem={handleCreateItem} isCreating={isCreating} />

            {/* Filter and Sort bar */}
            <FilterSortBar
              filter={filter}
              setFilter={setFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Tasks Container */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[48vh] pr-1" data-testid={testIds.todoItemListContainer}>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  {items.length === 0
                    ? "No tasks yet. Create one above to get started!"
                    : "No tasks match your selected filter."}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <TodoItem
                    key={item.id}
                    item={item}
                    onToggleItem={handleToggleItem}
                    onStartEdit={setEditingItem}
                    onDeleteItem={handleDeleteItem}
                    isToggling={isToggling}
                    isDeleting={isDeleting}
                    isNew={isNewItem(item.id)}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Edit Drawer Modal */}
      {editingItem && (
        <EditDrawer
          item={editingItem}
          onSave={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

export default TodosPage;
