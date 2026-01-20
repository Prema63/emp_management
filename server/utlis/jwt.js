import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
const algorithm = process.env.JWT_ALGORITHM;


export const generateToken = (payload, expiresIn = "30d") => {
  if (!secret) throw new Error("JWT_SECRET is not set in .env");
  
  return jwt.sign(payload, secret, {
    algorithm,
    expiresIn
  });
};

export const verifyToken = (token) => {
  if (!secret) throw new Error("JWT_SECRET is not set in .env");

  try {
    return jwt.verify(token, secret, { algorithms: [algorithm] });
  } catch (err) {
    return null;
  }
};


export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const payload = jwt.decode(token);
    return payload;
  } catch (err) {
    return null;
  }
};