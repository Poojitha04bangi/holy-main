 

import express from "express";
import multer from "multer";
import { uploadStatus } from "@/controllers/status.controller";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

 
router.post("/upload-status", upload.single("file"), uploadStatus);
 
import {getAllUploadedStatus } from "@/controllers/status.controller";  

router.get("/all-uploaded-status", getAllUploadedStatus);  

export default router;
