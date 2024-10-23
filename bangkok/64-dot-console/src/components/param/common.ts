export const VOID = Symbol("DotConsole.void");

export const INCOMPLETE = Symbol("DotConsole.incomplete");

export const INVALID = Symbol("DotConsole.invalid");

export type ParamInput<T> = T | typeof INCOMPLETE | typeof INVALID;

export type ParamProps<T> = {
  onChangeValue: (value: ParamInput<T>) => void;
};
