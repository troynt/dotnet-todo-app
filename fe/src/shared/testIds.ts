// Test IDs for E2E tests — import this module rather than hardcoding strings in test files.
export const testIds = {
  // Sidebar: workspace list
  sidebarCreateListButton: "sidebar-create-list-button",
  modalCreateListNameInput: "modal-create-list-name-input",
  modalCreateListDescriptionInput: "modal-create-list-description-input",
  modalCreateListSubmitButton: "modal-create-list-submit-button",
  modalCreateListCancelButton: "modal-create-list-cancel-button",

  // Add item form
  addItemTitleInput: "add-item-title-input",
  addItemDescriptionInput: "add-item-description-input",
  addItemSubmitButton: "add-item-submit-button",
  addItemDueDatePicker: "add-item-due-date-picker",

  // Each workspace list item (use index or name in tests)
  sidebarListItem: (listId: string) => `sidebar-list-item-${listId}`,
  sidebarDeleteListButton: (listId: string) => `sidebar-delete-list-btn-${listId}`,
  sidebarConfirmDeleteListButton: (listId: string) => `sidebar-delete-list-confirm-btn-${listId}`,

  // Each todo item row — each element keyed by the item's unique id
  todoItemListContainer: "todo-item-list-container",
  todoItemCheckbox: (itemId: string) => `todo-item-checkbox-${itemId}`,
  todoItemTitle: (itemId: string) => `todo-item-title-${itemId}`,
  todoItemDescription: (itemId: string) => `todo-item-desc-${itemId}`,
  todoItemEditButton: (itemId: string) => `todo-item-edit-btn-${itemId}`,
  todoItemDeleteButton: (itemId: string) => `todo-item-delete-btn-${itemId}`,
  todoItemConfirmDeleteButton: (itemId: string) => `todo-item-delete-btn-confirm-${itemId}`,

  // Edit drawer
  editDrawerTitleInput: "edit-drawer-title-input",
  editDrawerDueDatePicker: "edit-drawer-due-date-picker",
  editDrawerDescriptionInput: "edit-drawer-description-input",
  editDrawerCancelButton: "edit-drawer-cancel-button",
  editDrawerSaveButton: "edit-drawer-save-button",
  editDrawerHeading: "edit-drawer-heading",

  // List header
  todoListHeaderTitle: "todo-list-header-title",
  todoListProgress: "todo-list-progress",

  // Dashboard
  dashboardNavigateToList: (listId: string) => `dashboard-navigate-to-list-${listId}`,

  // Settings page
  settingsEmailNotificationsSwitch: "settings-email-notifications-switch",
  settingsPushNotificationsSwitch: "settings-push-notifications-switch",
  settingsDenseModeSwitch: "settings-dense-mode-switch",
  settingsDisplayNameInput: "settings-display-name-input",
  settingsEmailInput: "settings-email-input",
  settingsSaveProfileButton: "settings-save-profile-button",
} as const;
