const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("Usage: node make-admin.js <email>");
  console.log("Example: node make-admin.js admin@example.com");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");
    
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );
    
    if (user) {
      console.log(`\n✓ Success! User ${email} is now an admin!\n`);
      console.log(`User details:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Admin: ${user.isAdmin}`);
    } else {
      console.log(`\n✗ Error: User ${email} not found in database\n`);
      console.log("Please make sure the user has registered first.");
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
  });
