import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

// ── Validators ──────────────────────────────────────────────────────────────
import { RegisterValidator, LoginValidator, ForgotPasswordValidator, ResetPasswordValidator, RefreshTokenValidator, GoogleLoginSchema } from "../modules/auth/validators/auth.validator"

// ── Middlewares ──────────────────────────────────────────────────────────────
import { authMiddleware } from "../core/middlewares/auth.middleware"
import { validationHook } from "../core/helpers/validator"

// ── Modules (controllers wired with their dependencies) ──────────────────────
import { authController } from "../modules/auth/auth.module"

// ── Routes ───────────────────────────────────────────────────────────────────
const routes = new Hono()

// Auth
routes.post("/auth/register", zValidator("json", RegisterValidator, validationHook), (c) => authController.register(c))
routes.post("/auth/login", zValidator("json", LoginValidator, validationHook), (c) => authController.login(c))
routes.post("/auth/google", zValidator("json", GoogleLoginSchema, validationHook), (c) => authController.google(c))
routes.post("/auth/forgot-password", zValidator("json", ForgotPasswordValidator, validationHook), (c) => authController.forgotPassword(c))
routes.get("/auth/validate-reset-token", (c) => authController.validateResetToken(c))
routes.post("/auth/reset-password", zValidator("json", ResetPasswordValidator, validationHook), (c) => authController.resetPassword(c))
routes.post("/auth/refresh", zValidator("json", RefreshTokenValidator, validationHook), (c) => authController.refreshToken(c))
routes.get("/auth/me", authMiddleware, (c) => authController.me(c))
routes.post("/auth/logout", authMiddleware, (c) => authController.logout(c))

// Proxy MinIO
routes.get("/proxy", async (c) => {
    const path = c.req.query("path")
    if (!path) return c.json({ message: "Missing 'path' query parameter" }, 400)

    const { minio } = await import("../core/helpers/minio")
    return minio.proxyHandler(path)
})

export default routes
