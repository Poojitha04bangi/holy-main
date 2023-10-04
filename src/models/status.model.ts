  
// import mongoose from "mongoose";

// const statusUpdateSchema = new mongoose.Schema({
//   userId: String,
//   contentType: String,
//   content: String,
//   videoDuration: Number,
//   createdAt: Date,
//   expiresAt: Date,
// });

// const StatUpdate = mongoose.model("StatusUpdate", statusUpdateSchema);
// statusUpdateSchema.ensureIndex({ createdAt: 1 }, { expireAfterSeconds: 120 })
// export default StatUpdate;

import mongoose from "mongoose";

const statusUpdateSchema = new mongoose.Schema({
  userId: String,
  contentType: String,
  content: String,
  videoDuration: Number,
  createdAt: Date,
  expiresAt: Date, // Make sure you have the expiresAt field in the schema
});

statusUpdateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 120 }); // Create an index on expiresAt field

const StatUpdate = mongoose.model("StatusUpdate", statusUpdateSchema);
export default StatUpdate;
