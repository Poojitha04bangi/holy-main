// import mongoose from "mongoose";
// import { bucket } from "@/databases/index";


import mongoose from "mongoose";
import { bucket } from "@/databases/index";

import {videoBucket} from "@/databases/index"
 
export const uploadVideo = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded." });
      }
  
      console.log("SUCCESS");
  
      const name = req.file?.originalname;
      const buffer = req.file?.buffer;
  
      if (!name?.match(/\.(mp4|avi|mkv|mov)$/i)) {
        return res.status(400).json({ error: "Unsupported file format." });
      }
   
  
      const start = buffer.indexOf(Buffer.from("mvhd")) + 17;
      const timeScale = buffer.readUInt32BE(start, 4);
      const _d = buffer.readUInt32BE(start + 4, 4);
      const _a = Math.floor((_d / timeScale) * 1000) / 1000;
       
      const duration = Number(_a)
  
      if(duration > 15 && duration < 60){
  
        console.log('DONE ')
      }else{
        res.status(500).send('Hey reduce the video duration')
      }
  
      const writeStream = await videoBucket.openUploadStream(name);
  
      writeStream.write(buffer);
      writeStream.end();
  
      writeStream.on("finish", async () => {
        const videoId = writeStream.id.toString();
  
        console.log(videoId);
        res.send({ ...req.body, ...req.file, buffer: undefined });
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

//  Get Id By Video With Play Video
export const videoByIDPlay = async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid song ID format" });
      }
      const songStream = bucket.openDownloadStream(
        new mongoose.Types.ObjectId(id)
      );
      res.setHeader("Content-Type", "video/mp4");
      songStream.pipe(res);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "An error occurred while fetching songs." });
    }
  };