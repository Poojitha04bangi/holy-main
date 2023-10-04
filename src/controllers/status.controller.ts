// import { videoBucket } from "@/databases";
// import slugMaker from "@/utils/slug-maker";
// import StatUpdate from "@/models/status.model";

// export const uploadStatus = async (req, res) => {
//  console.log("FILE RESPONSE",req.file);
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No status file uploaded." });
//     }

//     const { originalname:name, buffer,mimetype } = req.file;
//     const originalname= slugMaker(name);
//     console.log(originalname)
 
//     if (mimetype.includes('video')) {
//       if (!originalname.match(/\.(mp4|avi|mkv|mov)$/i)) {
//         return res
//           .status(400)
//           .json({ error: "Unsupported video file format." });
//       }
//       const expirationTime = new Date();
//       expirationTime.setMinutes(expirationTime.getMinutes() + 2);


//       const start = buffer.indexOf(Buffer.from("mvhd")) + 17;
//       const timeScale = buffer.readUInt32BE(start, 4);
//       const _d = buffer.readUInt32BE(start + 4, 4);
//       const _a = Math.floor((_d / timeScale) * 1000) / 1000;
//       const duration = Number(_a);
//       console.log({ duration });

//       if (duration < 15 || duration > 60) {
//         return res
//           .status(400)
//           .json({ error: "Video duration should be 15 to 60 seconds." });
//       }
//     }  
    

//     const writeStream = await videoBucket.openUploadStream(originalname);
//     writeStream.write(buffer);
//     writeStream.end();
//     writeStream.on("finish", async () => {
//       const mediaId = writeStream.id.toString();
//       console.log(writeStream)
//       console.log(`Media uploaded: ${mediaId}`);
//       res.json({ mediaId,originalname,mimetype });
//     });

//   } catch (error) {
//     console.error("Error uploading media:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
 






import mongoose from "mongoose";
import StatUpdate from "@/models/status.model";
import { videoBucket } from "@/databases";
import slugMaker from "@/utils/slug-maker";
import cron from "node-cron";

export const uploadStatus = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No status file uploaded." });
    }

    const { originalname: name, buffer, mimetype } = req.file;
    const originalname = slugMaker(name);

    if (mimetype.includes('video')) {
      if (!originalname.match(/\.(mp4|avi|mkv|mov)$/i)) {
        return res.status(400).json({ error: "Unsupported video file format." });
      }

      const start = buffer.indexOf(Buffer.from("mvhd")) + 17;
      const timeScale = buffer.readUInt32BE(start, 4);
      const _d = buffer.readUInt32BE(start + 4, 4);
      const _a = Math.floor((_d / timeScale) * 1000) / 1000;
      const duration = Number(_a);

      if (duration < 15 || duration > 60) {
        return res.status(400).json({ error: "Video duration should be 15 to 60 seconds." });
      }

      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 2);
      // Create and save the video status to MongoDB
      const videoStatus = new StatUpdate({
        contentType: 'video',
        content: originalname, // Store video filename or other relevant data
        videoDuration: duration,
        createdAt: new Date(),
        expiresAt: expirationDate,
      });

      await videoStatus.save();
    } else if (mimetype.includes('text')) {
      // Handle text uploads here
      const textContent = buffer.toString();

      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 2); // Change to 2 minutes

      const textStatus = new StatUpdate({
        contentType: 'text',
        content: textContent,
        createdAt: new Date(),
        expiresAt: expirationDate,
      });

      await textStatus.save();
    } else {
      return res.status(400).json({ error: "Unsupported content type." });
    }

    const writeStream = await videoBucket.openUploadStream(originalname);
    writeStream.write(buffer);
    writeStream.end();

    writeStream.on("finish", async () => {
      const mediaId = writeStream.id.toString();
      res.json({ mediaId, originalname, mimetype });
    });
  } catch (error) {
    console.error("Error uploading status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cron job for deleting expired data after 2 minutes
cron.schedule("*/2 * * * *", async () => {
  try {
    const currentTime = new Date();
    await StatUpdate.deleteMany({ expiresAt: { $lte: currentTime } });
    console.log("Expired data deleted.");
  } catch (error) {
    console.error("Error deleting expired data:", error);
  }
});

export const getAllUploadedStatus = async (req, res) => {
  try {
    const uploadedStatus = await videoBucket.find().toArray();
    res.json(uploadedStatus);
  } catch (error) {
    console.error("Error fetching uploaded status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
