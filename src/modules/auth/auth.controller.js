import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { success } from "zod";

export const authController = {
  register: async (req, res) => {
    //* logic
    // * giao viec cho services
    const { email, password } = req.validated;
    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({
        success: false,
        message: "Da co loi xay ra!",
      });
    // * brute force

    const hashPass = bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashPass });

    newUser.password = undefined;
    // service mail (verify Email)
    return res.status(201).json({
      success: true,
      message: "Dang ky thanh cong, vui long kiem tra email",
      data: newUser,
    });
  },

  login: async (req, res) => {},

  refreshToken: async (req, res) => {},
  forgotPassword: async (req, res) => {},
  resetPassword: async (req, res) => {},
  logout: async (req, res) => {},
};
