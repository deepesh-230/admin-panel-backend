"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const bootstrap_1 = require("../src/bootstrap");
let cachedApp = null;
async function getApp() {
    if (!cachedApp) {
        const { expressApp } = await (0, bootstrap_1.createNestApp)();
        cachedApp = expressApp;
    }
    return cachedApp;
}
async function handler(req, res) {
    const app = await getApp();
    return app(req, res);
}
//# sourceMappingURL=index.js.map