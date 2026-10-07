import mongoose from "mongoose";

export function connectDB() {
  mongoose
    .connect(
      "mongodb+srv://hr_db_user:kBFaVyJBcPR1JlbT@cluster0.d68h30d.mongodb.net/tienthanh-db?appName=Cluster0",
    )
    .then(() => {
      console.log(`Connect Database successfully!`);
    })
    .catch((err) => {
      console.log(`Connect Database failed: ${JSON.stringify(err)}`);
    });
}
