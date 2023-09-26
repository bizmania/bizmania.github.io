export const notUndefined = <T>(value: T | undefined): value is T => value !== undefined;

export const notEmpty = <T>(value: T | undefined): value is T => Boolean(value);
