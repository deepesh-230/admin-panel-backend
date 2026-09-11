/**
 * Vercel serverless entry. Loads the Nest build from `dist/` so @vercel/node
 * does not re-typecheck the Nest source tree (avoids Prisma/pnpm type noise).
 */
let cachedApp = null;

async function getApp() {
  if (!cachedApp) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createNestApp } = require('../dist/bootstrap');
    const { expressApp } = await createNestApp();
    cachedApp = expressApp;
  }
  return cachedApp;
}

module.exports = async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
};
