import Admin from "../model/admin.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await (password === admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id.toString() },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "7h" }
    );

    console.log(
      "SIGN SECRET:",
      JSON.stringify(process.env.ADMIN_JWT_SECRET)
    );


    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { adminLogin };