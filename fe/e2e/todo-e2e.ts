import { test, expect } from "@playwright/test";
import { testIds } from "../src/shared/testIds";

test.describe("Todo Application E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/todos");
    await page.waitForLoadState("networkidle");
  });

  test("should manage workspace and tasks successfully", async ({ page }) => {
    const uniqueId = Date.now();
    const workspaceName = `E2E Workspace ${uniqueId}`;
    const workspaceDesc = `Playwright E2E Test workspace description ${uniqueId}`;

    // --- 1. Workspace Creation ---
    console.log("Creating workspace...");

    await page.getByTestId(testIds.sidebarCreateListButton).click();

    await page.getByTestId(testIds.modalCreateListNameInput).fill(workspaceName);
    await page.getByTestId(testIds.modalCreateListDescriptionInput).fill(workspaceDesc);

    await page.getByTestId(testIds.modalCreateListSubmitButton).click();

    // Verify URL changed to a new list
    await expect(page).toHaveURL(/\/todos\/[a-f0-9-]+/);

    // Extract the list ID from the URL for sidebar operations
    const urlMatch = page.url().match(/\/todos\/([a-f0-9-]+)/);
    const listId = urlMatch ? urlMatch[1] : "";

    expect(listId).toBeDefined();

    if (listId) {
      const sidebarItem = page.getByTestId(testIds.sidebarListItem(listId));
      await expect(sidebarItem).toBeVisible();
    }

    // Verify header title matches the created workspace name
    await expect(page.getByTestId(testIds.todoListHeaderTitle)).toHaveText(workspaceName);

    // --- 2. Add Tasks ---
    console.log("Adding tasks...");

    const task1Title = `E2E Task 1 ${uniqueId}`;
    const task1Desc = `E2E Task 1 desc ${uniqueId}`;
    const task2Title = `E2E Task 2 ${uniqueId}`;
    const task2Desc = `E2E Task 2 desc ${uniqueId}`;

    await page.getByTestId(testIds.addItemTitleInput).fill(task1Title);
    await page.getByTestId(testIds.addItemDescriptionInput).fill(task1Desc);
    await page.getByTestId(testIds.addItemSubmitButton).click();

    // Add task 2
    await page.getByTestId(testIds.addItemTitleInput).fill(task2Title);
    await page.getByTestId(testIds.addItemDescriptionInput).fill(task2Desc);
    await page.getByTestId(testIds.addItemSubmitButton).click();

    console.log("Deleting tasks...")
    const todoLocators = await page.locator("[data-testid^='todo-item-row-']").all();
    const todoIds = (await Promise.all(todoLocators.map(l => l.getAttribute('data-testid'))))
        .map(id => id?.replace('todo-item-row-', '') || '');

    for (const todoId of todoIds) {
      await page.getByTestId(testIds.todoItemDescription(todoId)).hover();
      await page.getByTestId(testIds.todoItemDeleteButton(todoId)).click();
      await page.getByTestId(testIds.todoItemConfirmDeleteButton(todoId)).click();
    }

    console.log("Deleting workspace")
    await page.getByTestId(testIds.sidebarListItem(listId!)).hover();
    await page.getByTestId(testIds.sidebarDeleteListButton(listId!)).click();
    await page.getByTestId(testIds.sidebarConfirmDeleteListButton(listId!)).click();
  });
});
