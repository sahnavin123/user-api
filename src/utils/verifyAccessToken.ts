import jwt from 'jsonwebtoken';

export const verifyAccessToken = (token: string) => {
  const verifiedToken = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  ) as jwt.JwtPayload;

  return verifiedToken;
};
