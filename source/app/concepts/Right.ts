import type { Either } from "./Either";
import type { Left } from "./Left";

export class Right<L, R> {
  private constructor(private readonly value: R) {}

  public static of<L, R>(value: R): Either<L, R> {
    return new Right(value);
  }

  public isLeft(): this is Left<L, R> {
    return false;
  }

  public isRight(): this is Right<L, R> {
    return true;
  }

  public get(): R {
    return this.value;
  }
}
