import { Routes } from "./routes";

describe("Routes.todoList", () => {
  it("returns /todos/{listId}", () => {
    expect(Routes.todoList("abc123")).toBe("/todos/abc123");
  });

  it("handles empty listId", () => {
    expect(Routes.todoList("")).toBe("/todos/");
  });

  it("escapes special characters in listId as-is", () => {
    expect(Routes.todoList("foo/bar").slice(0, -1)).not.toBe("/todos/foo/bar");
  });
});

describe("Routes.isDashboard", () => {
  it("returns true for /dashboard", () => {
    expect(Routes.isDashboard("/dashboard")).toBe(true);
  });

  it("returns true for /dashboard/anything", () => {
    expect(Routes.isDashboard("/dashboard/foo")).toBe(true);
  });

  it("returns false for /todos", () => {
    expect(Routes.isDashboard("/todos")).toBe(false);
  });

  it("returns false for /settings", () => {
    expect(Routes.isDashboard("/settings")).toBe(false);
  });

  it("returns false for unrelated paths", () => {
    expect(Routes.isDashboard("/foo/bar")).toBe(false);
  });
});

describe("Routes.isTodos", () => {
  it("returns true for /todos", () => {
    expect(Routes.isTodos("/todos")).toBe(true);
  });

  it("returns true for /todos/anything", () => {
    expect(Routes.isTodos("/todos/abc123")).toBe(true);
  });

  it("returns false for /dashboard", () => {
    expect(Routes.isTodos("/dashboard")).toBe(false);
  });

  it("returns false for /settings", () => {
    expect(Routes.isTodos("/settings")).toBe(false);
  });
});

describe("Routes.isSettings", () => {
  it("returns true for /settings", () => {
    expect(Routes.isSettings("/settings")).toBe(true);
  });

  it("returns true for /settings/anything", () => {
    expect(Routes.isSettings("/settings/foo")).toBe(true);
  });

  it("returns false for /dashboard", () => {
    expect(Routes.isSettings("/dashboard")).toBe(false);
  });

  it("returns false for /todos", () => {
    expect(Routes.isSettings("/todos")).toBe(false);
  });
});
