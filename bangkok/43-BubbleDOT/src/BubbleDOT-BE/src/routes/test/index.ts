import express from "express";
import testController from "../../controllers/test.controller";


const testRouter = express.Router();
testRouter.get("/", testController.test);


export default testRouter;