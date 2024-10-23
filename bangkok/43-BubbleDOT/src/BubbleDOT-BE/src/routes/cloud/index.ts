import express from "express";
import { downloadFileFromS3 } from "../../controllers/DownloadCloud.controller";
import { buildEndpoint } from "../../controllers/build.controller";
import { deployEndpoint } from "../../controllers/deploy.controller";
import { getAllDataController } from "../../controllers/getData.controller";
const router = express.Router();

router.post('/download-bucket', downloadFileFromS3);
router.post('/build', buildEndpoint);
//router.post('/deploy', deployEndpoint);
router.get('/get-data', getAllDataController);
export default router;
