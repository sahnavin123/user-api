import jwt from 'jsonwebtoken';
import cron from 'node-cron';

export const blacklistedTokens: Map<string, number> = new Map();

// Time-to-live for each entry in milliseconds (e.g., 24 hours)
const timeToRemoveToken = 24 * 60 * 60 * 1000;

// Function to check if a token is blacklisted
export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};

// Function to invalidate a token by adding it to the blacklist with a TTL
export const invalidateToken = (token: string): void => {
  blacklistedTokens.set(token, Date.now());
};

export const verifyAccessToken = (token: string) => {
  const verifiedToken = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  ) as jwt.JwtPayload;

  return verifiedToken;
};

const cleanUpBlacklistedTokens = () =>{
  const currentTime = Date.now();

  for (const [token, timestamp] of blacklistedTokens) {
    if (currentTime - timestamp > timeToRemoveToken) {
      blacklistedTokens.delete(token);
    }
  }

  console.log('Blacklisted tokens cleaned up:', blacklistedTokens);
};

// Cron job to clean up blacklisted tokens every 24 hours
cron.schedule('0 0 * * *', () => {
  cleanUpBlacklistedTokens();
});
