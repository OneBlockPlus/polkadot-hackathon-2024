import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dbDirectory = path.join(__dirname, '../db');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

export const connectDb = async () => {
  return open({
    filename: path.join(dbDirectory, 'dev.sqlite'),
    driver: sqlite3.Database,
  });
};