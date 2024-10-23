import mongoose from "mongoose";
import os from "os";
import process from "process";
const countConnect = () => {
  const numberConnecttions = mongoose.connections.length;
  console.log("Number of connections: ", numberConnecttions);
};
const checkOverload = () => {
  const _SECONDS = 5000;
  setInterval(() => {
    const numberConnecttions = mongoose.connections.length;
    const cpus = os.cpus().length;
    const memoryUsage = process.memoryUsage();
    console.log("Number of connections: ", numberConnecttions);
    console.log("Number of CPUs: ", cpus);
    console.log("Memory usage: ", memoryUsage);
    const maxConnections = cpus * 5;
    if (numberConnecttions > maxConnections) {
      console.error("Overload!");
    }
  }, _SECONDS);
};
export { countConnect, checkOverload };