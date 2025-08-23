import { AccountModel } from "../../common/models/AccountModel";
import { TaskModel } from "../../common/models/TaskModel";
import { ApiResponse } from "../../common/schemas/ApiResponse";
import type { Hostnames } from "../../common/schemas/Hostnames";
import type { Either } from "../concepts/Either";
import { Left } from "../concepts/Left";
import { Right } from "../concepts/Right";
import { AuthError } from "../errors/AuthError";

export class ApiService {
  public static async refresh(): Promise<Either<Error[], null>> {
    try {
      return await this._refresh();
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async login(
    username: string,
    password: string,
  ): Promise<Either<Error[], AccountModel>> {
    const endpoint = "/api/auth/login";
    const method = "POST";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(await response.json(), (data) =>
        AccountModel.fromData(data),
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format.")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async signup(
    username: string,
    password: string,
  ): Promise<Either<Error[], AccountModel>> {
    const endpoint = "/api/auth/signup";
    const method = "POST";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(await response.json(), (data) =>
        AccountModel.fromData(data),
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async logout(): Promise<Either<Error[], null>> {
    const endpoint = "/api/auth/logout";
    const method = "PUT";
    try {
      const refreshResult = await ApiService._refresh();
      if (refreshResult.isLeft()) {
        return Left.of(refreshResult.get());
      }
      const response = await fetch(endpoint, { method });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(
        await response.json(),
        () => null,
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async getTasks(): Promise<Either<Error[], TaskModel[]>> {
    const endpoint = "/api/tasks/";
    const method = "GET";
    try {
      const refreshResult = await ApiService._refresh();
      if (refreshResult.isLeft()) {
        return Left.of(refreshResult.get());
      }
      const response = await fetch(endpoint, { method });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(
        await response.json(),
        (data) => {
          if (!Array.isArray(data)) {
            return Error();
          }
          const tasks: TaskModel[] = [];
          for (const item of data) {
            const task = TaskModel.fromData(item);
            if (task instanceof Error) {
              return Error();
            }
            tasks.push(task);
          }
          return tasks;
        },
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async createTask(
    title: string,
    description: string,
    isCompleted: boolean,
  ): Promise<Either<Error[], TaskModel>> {
    const endpoint = "/api/tasks/";
    const method = "POST";
    try {
      const refreshResult = await ApiService._refresh();
      if (refreshResult.isLeft()) {
        return Left.of(refreshResult.get());
      }
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, isCompleted }),
      });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(await response.json(), (data) =>
        TaskModel.fromData(data),
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async getTask(
    taskId: number,
  ): Promise<Either<Error[], TaskModel>> {
    const endpoint = `/api/tasks/${taskId}`;
    const method = "GET";
    try {
      const refreshResult = await ApiService._refresh();
      if (refreshResult.isLeft()) {
        return Left.of(refreshResult.get());
      }
      const response = await fetch(endpoint, { method });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(await response.json(), (data) =>
        TaskModel.fromData(data),
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async updateTask(
    taskId: number,
    title: string,
    description: string,
    isCompleted: boolean,
  ): Promise<Either<Error[], TaskModel>> {
    const endpoint = `/api/tasks/${taskId}`;
    const method = "PUT";
    try {
      const refreshResult = await ApiService._refresh();
      if (refreshResult.isLeft()) {
        return Left.of(refreshResult.get());
      }
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, isCompleted }),
      });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(await response.json(), (data) =>
        TaskModel.fromData(data),
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  public static async deleteTask(
    taskId: number,
  ): Promise<Either<Error[], null>> {
    const endpoint = `/api/tasks/${taskId}`;
    const method = "DELETE";
    try {
      const refreshResult = await ApiService._refresh();
      if (refreshResult.isLeft()) {
        return Left.of(refreshResult.get());
      }
      const response = await fetch(endpoint, { method });
      if (
        !response.ok ||
        !response.headers
          .get("Content-Type")
          ?.toLowerCase()
          .includes("application/json")
      ) {
        return Left.of(await ApiService.getErrors(endpoint, method, response));
      }
      const apiResponse = ApiResponse.fromJson(
        await response.json(),
        () => null,
      );
      if (!apiResponse) {
        return Left.of([new Error("Invalid API response format")]);
      }
      this.logHostnames(endpoint, method, apiResponse.hostnames);
      return Right.of(apiResponse.data);
    } catch {
      return Left.of([new Error("Network error occurred.")]);
    }
  }

  // >-------------------------< Private Methods >--------------------------< //

  private static async _refresh(): Promise<Either<Error[], null>> {
    const endpoint = "/api/auth/refresh";
    const method = "GET";
    const response = await fetch(endpoint, { method });
    if (
      !response.ok ||
      !response.headers
        .get("Content-Type")
        ?.toLowerCase()
        .includes("application/json")
    ) {
      return Left.of(await ApiService.getErrors(endpoint, method, response));
    }
    const apiResponse = ApiResponse.fromJson(await response.json(), () => null);
    if (!apiResponse) {
      return Left.of([new Error("Invalid API response format")]);
    }
    this.logHostnames(endpoint, method, apiResponse.hostnames);
    return Right.of(apiResponse.data);
  }

  private static async getErrors(
    endpoint: string,
    method: string,
    response: Response,
  ): Promise<Error[]> {
    if (response.status === 401) {
      return [new AuthError()];
    }
    if (
      response.headers
        .get("Content-Type")
        ?.toLowerCase()
        .includes("application/json")
    ) {
      const apiResponse = ApiResponse.fromJson(
        await response.json(),
        () => null,
      );
      if (apiResponse) {
        this.logHostnames(endpoint, method, apiResponse.hostnames);
        if (apiResponse.clientErrors !== undefined) {
          return apiResponse.clientErrors.map(
            (error) => new Error(error.message),
          );
        } else {
          return [new Error(response.statusText)];
        }
      }
      return [new Error(response.statusText)];
    }
    return [new Error(response.statusText)];
  }

  private static logHostnames(
    endpoint: string,
    method: string,
    hostnames: Hostnames,
  ): void {
    console.log(
      `${method} - ${endpoint} | Responding Hosts:\n` +
        `  Gateway API\t:\t${hostnames.gatewayApi}\n` +
        `  Auth API\t:\t${hostnames.authApi}\n` +
        `  Tasks API\t:\t${hostnames.tasksApi}`,
    );
  }
}
