// Extend Express Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: import('./services/jwt.js').JWTPayload;
        }
    }
}

export { };