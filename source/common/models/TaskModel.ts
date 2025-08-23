export class TaskModel {
  constructor(
    public readonly taskId: number,
    public title: string,
    public description: string,
    public isCompleted: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  public static fromData(data: unknown): TaskModel | Error {
    if (!TaskModel.isValidData(data)) {
      return Error();
    }
    return new TaskModel(
      data.taskId,
      data.title,
      data.description,
      data.isCompleted,
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );
  }

  private static isValidData(data: unknown): data is TaskModel {
    if (typeof data !== "object" || data === null) {
      return false;
    }
    const model = data as TaskModel;
    return (
      typeof model.taskId === "number" &&
      typeof model.title === "string" &&
      typeof model.description === "string" &&
      typeof model.isCompleted === "boolean" &&
      typeof model.createdAt === "string" &&
      !Number.isNaN(Date.parse(model.createdAt)) &&
      typeof model.updatedAt === "string" &&
      !Number.isNaN(Date.parse(model.updatedAt))
    );
  }
}
