import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { proxy } from "hono/proxy";
import { basicAuth } from "hono/basic-auth";
const app = new Hono();
// Configuration
const PIKO_BASE_URL = "http://load-balancer:8000";
const PIKO_ADMIN_URL = "http://load-balancer:8002";
// API Guard - Basic Auth
const API_USERNAME = process.env.API_USERNAME || "admin";
const API_PASSWORD = process.env.API_PASSWORD || "password";
// Health check (no auth required)
app.get("/", (c) => {
    return c.json({
        message: "Piko Proxy Server",
        status: "healthy",
    });
});
// Apply auth guard to protected routes
app.use("/client", basicAuth({
    username: API_USERNAME,
    password: API_PASSWORD,
}));
app.use("/admin/*", basicAuth({
    username: API_USERNAME,
    password: API_PASSWORD,
}));
// Forward all requests to Piko cluster
app.all("/client", (c) => {
    return proxy(PIKO_BASE_URL, {
        ...c.req,
        headers: {
            ...c.req.header(),
        },
    });
});
// Admin endpoints
app.get("/admin/*", (c) => {
    const path = c.req.path.replace("/admin", "");
    return proxy(`${PIKO_ADMIN_URL}${path}`);
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`🚀 Piko Proxy Server running on http://localhost:${info.port}`);
    console.log(`🔐 Protected endpoints require basic auth (${API_USERNAME}:${API_PASSWORD})`);
});
