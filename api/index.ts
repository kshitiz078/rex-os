/**
 * Vercel Serverless Function entrypoint.
 * Re-exports the Express app so Vercel's @vercel/node runtime can serve it.
 */
export { default } from "../backend/src/index";
