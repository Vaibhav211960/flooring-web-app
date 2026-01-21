import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Get logged-in user's profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById("6959016e3124075337f64c71").select("-password");
    res.status(200).json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update logged-in user's profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Profile updated", user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Delete user
 */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
