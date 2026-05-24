export class Routes {
  static readonly dashboard = "/dashboard";
  static readonly todos = "/todos";
  static readonly settings = "/settings";

  static todoList(listId: string): string {
    return `/todos/${listId}`;
  }

  static isDashboard(pathname: string): boolean {
    return pathname.startsWith(this.dashboard);
  }

  static isTodos(pathname: string): boolean {
    return pathname.startsWith("/todos");
  }

  static isSettings(pathname: string): boolean {
    return pathname.startsWith(this.settings);
  }
}
