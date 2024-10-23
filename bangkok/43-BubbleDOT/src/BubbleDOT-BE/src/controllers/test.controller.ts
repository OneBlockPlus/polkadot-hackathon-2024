import { Request, Response } from "express";
import testService from "../services/test.service";
class TestController {
  test(req: Request, res: Response): void {
    res.status(200).json(testService.test());
  }
}
const testController = new TestController();
export default testController;