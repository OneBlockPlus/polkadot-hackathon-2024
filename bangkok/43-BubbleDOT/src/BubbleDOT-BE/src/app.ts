import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import router from "./routes";

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan("short"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

export default app;
