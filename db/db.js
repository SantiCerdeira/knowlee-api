import mongoose from "mongoose";
import dotenv from "dotenv";
import { schedulePremiumExpirationCheck } from "../models/User.js";

dotenv.config();

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    schedulePremiumExpirationCheck();
  })
  .catch((err) => console.log(err));

const db = mongoose.connection;

export default db;
