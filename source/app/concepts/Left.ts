import type { Either } from "./Either";
import type { Right } from "./Right";

export class Left<L, R> {
  private constructor(private readonly value: L) {}

  public static of<L, R>(value: L): Either<L, R> {
    return new Left(value);
  }

  public isLeft(): this is Left<L, R> {
    return true;
  }

  public isRight(): this is Right<L, R> {
    return false;
  }

  public get(): L {
    return this.value;
  }
}
