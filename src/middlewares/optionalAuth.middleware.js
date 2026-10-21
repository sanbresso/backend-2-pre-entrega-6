import { verifyToken } from "../utils/jwt.js";

export const optionalAuth = (req, res, next) => {
  const token = req.cookies?.currentUser;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);

    if (
      decoded &&
      typeof decoded.id === "string" &&
      typeof decoded.email === "string" &&
      typeof decoded.role === "string"
    ) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }

    return next();
  } catch (error) {
    return next();
  }
};