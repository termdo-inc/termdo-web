import type { Left } from "./Left";
import type { Right } from "./Right";

export type Either<L, R> = Left<L, R> | Right<L, R>;
