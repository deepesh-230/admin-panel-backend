/**
 * Vercel entry. Loads the Nest build copied next to this file during
 * `vercel-build` (see package.json) so the function bundle always includes it.
 */
module.exports = require('./nest/serverless').default;
