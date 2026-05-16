const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { default: AccountModel } = require("../models/AccountModel");


const isVerifiedUser = (allowedRoles = []) => {
  return async (req, res, next) => {
 
    try {
      const { accessToken } = req.cookies;
      console.log(accessToken)
      if (!accessToken) {
        return res.status(401).json({ message: "No token" });
      }

      const decoded = jwt.verify(accessToken, config.accessTokenSecret);

      const user = await AccountModel.findById(decoded.id);

      req.user = user;
      next();

    } catch (error) {

      // 🔥 HANDLE EXPIRED TOKEN
      if (error.name === "TokenExpiredError") {
        res.clearCookie("accessToken"); // ✅ remove old cookie
        return res.status(401).json({ message: "Sesson expired, login again" });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = { isVerifiedUser };