const mongoos = require("mongoose");

const connectDB = async () => {
  try {
    await mongoos.connect(process.env.DATABASE_URL);
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectDB;
