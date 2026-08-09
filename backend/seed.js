require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

const seed = async () => {
  await connectDB();

  const demoUsers = [
    { name: "Admin User", email: "admin@arcticair.com", password: "password123", role: "admin" },
    {
      name: "Dana Dispatcher",
      email: "dispatcher@arcticair.com",
      password: "password123",
      role: "dispatcher",
    },
    {
      name: "Tom Technician",
      email: "technician@arcticair.com",
      password: "password123",
      role: "technician",
      skills: ["AC Repair", "Duct Cleaning"],
    },
    {
      name: "Casey Customer",
      email: "customer@arcticair.com",
      password: "password123",
      role: "customer",
      address: "123 Maple St",
      city: "Austin",
    },
  ];

  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created ${u.role}: ${u.email}`);
    } else {
      console.log(`Skipped (exists): ${u.email}`);
    }
  }

  console.log("Seeding complete. All demo passwords: password123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
