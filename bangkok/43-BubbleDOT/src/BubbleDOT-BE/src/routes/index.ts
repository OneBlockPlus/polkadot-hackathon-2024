import express from "express";
import testRouter from "./test";
import cloudRouter from "./cloud";

const router = express.Router();

router.use("/test", testRouter);
router.use("/cloud", cloudRouter);

export default router;