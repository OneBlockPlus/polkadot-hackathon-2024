
import path from 'path'
import fs from 'fs'


export const BASIC_Neja_FILE = `
// The Entry Point.
// is_sender_origin: 0 means tx from cloud function and 1 means from user.
@external("env", "run_ext")
declare function run_ext(ptr: i32, len: i32, is_sender_origin: i32): void;

// This is the starting point, main function.
// Implement your cloud function logic here.
export function main(): i64 {
  return 0;
}
`

export const constructAlgorithmHelper = () => {
  let indexCount = 0;
  let str = `
// Auto Generated File.
// Created using Neja CLI.
// To update the classes, use the "neja setup <dir_name>" at the root directory.

@inline
function readMemory<T>(index: usize): T {
  return load<T>(index);
}


export class Neja {}
`;

  return str;
}