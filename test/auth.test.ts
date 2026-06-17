import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import {
    initTestDatabase,
    destroyTestDatabase,
    cleanTestDatabase,
    createTestApp,
    request,
    registerAndLogin,
} from "./setup"
import { createUserData, resetCounters } from "./helpers"

// ── Setup ───────────────────────────────────────────────────────────────────

let app: Hono

beforeAll(async () => {
    await initTestDatabase()
    app = createTestApp()
})

afterAll(async () => {
    await destroyTestDatabase()
})

beforeEach(async () => {
    await cleanTestDatabase()
    resetCounters()
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/register
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/auth/register", () => {
    test("should register a new user successfully", async () => {
        const userData = createUserData()

        const { status, body } = await request(app, "/api/auth/register", {
            method: "POST",
            body: userData,
        })

        expect(status).toBe(201)
        expect(body.success).toBe(true)
        expect(body.statusCode).toBe(201)
        expect(body.message).toBe("User registered successfully")
        expect(body.data).toBeDefined()
        expect(body.data.email).toBe(userData.email)
        expect(body.data.name).toBe(userData.name)
        expect(body.data.id).toBeDefined()
        // Password should NOT be in response
        expect(body.data.password).toBeUndefined()
    })

    test("should fail when email is already registered", async () => {
        const userData = createUserData()

        // Register first time
        await request(app, "/api/auth/register", { method: "POST", body: userData })

        // Register again with same email
        const { status, body } = await request(app, "/api/auth/register", {
            method: "POST",
            body: userData,
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
        expect(body.message).toBe("Email already in use")
    })

    test("should fail validation when name is missing", async () => {
        const { status, body } = await request(app, "/api/auth/register", {
            method: "POST",
            body: { email: "test@example.com", password: "password123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })

    test("should fail validation when email is invalid", async () => {
        const { status, body } = await request(app, "/api/auth/register", {
            method: "POST",
            body: { name: "Test", email: "not-an-email", password: "password123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })

    test("should fail validation when password is too short", async () => {
        const { status, body } = await request(app, "/api/auth/register", {
            method: "POST",
            body: { name: "Test", email: "test@example.com", password: "123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/auth/login", () => {
    test("should login successfully with valid credentials", async () => {
        const userData = createUserData()
        await request(app, "/api/auth/register", { method: "POST", body: userData })

        const { status, body } = await request(app, "/api/auth/login", {
            method: "POST",
            body: { email: userData.email, password: userData.password },
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toBe("Logged in successfully")
        expect(body.data.user).toBeDefined()
        expect(body.data.user.email).toBe(userData.email)
        expect(body.data.accessToken).toBeDefined()
        expect(body.data.refreshToken).toBeDefined()
        // Password should NOT be in response
        expect(body.data.user.password).toBeUndefined()
    })

    test("should fail with unregistered email", async () => {
        const { status, body } = await request(app, "/api/auth/login", {
            method: "POST",
            body: { email: "notexist@example.com", password: "password123" },
        })

        expect(status).toBe(401)
        expect(body.success).toBe(false)
    })

    test("should fail with wrong password", async () => {
        const userData = createUserData()
        await request(app, "/api/auth/register", { method: "POST", body: userData })

        const { status, body } = await request(app, "/api/auth/login", {
            method: "POST",
            body: { email: userData.email, password: "wrongpassword" },
        })

        expect(status).toBe(401)
        expect(body.success).toBe(false)
    })

    test("should fail validation without email", async () => {
        const { status, body } = await request(app, "/api/auth/login", {
            method: "POST",
            body: { password: "password123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })

    test("should fail validation without password", async () => {
        const { status, body } = await request(app, "/api/auth/login", {
            method: "POST",
            body: { email: "test@example.com" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/auth/refresh", () => {
    test("should refresh token successfully", async () => {
        const { refreshToken } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/refresh", {
            method: "POST",
            body: { refreshToken },
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toBe("Token refreshed successfully")
        expect(body.data.accessToken).toBeDefined()
        expect(body.data.refreshToken).toBeDefined()
        expect(body.data.user).toBeDefined()
    })

    test("should fail with invalid refresh token", async () => {
        const { status, body } = await request(app, "/api/auth/refresh", {
            method: "POST",
            body: { refreshToken: "invalid-token-here" },
        })

        expect(status).toBe(401)
        expect(body.success).toBe(false)
    })

    test("should fail validation without refresh token", async () => {
        const { status, body } = await request(app, "/api/auth/refresh", {
            method: "POST",
            body: {},
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/auth/me
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/auth/me", () => {
    test("should return current user profile", async () => {
        const { headers, user } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/me", {
            method: "GET",
            headers,
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toBe("User profile retrieved successfully")
        expect(body.data.email).toBe(user.email)
        expect(body.data.name).toBe(user.name)
        expect(body.data.id).toBe(user.id)
        // Password should NOT be in response
        expect(body.data.password).toBeUndefined()
    })

    test("should fail without auth token", async () => {
        const { status, body } = await request(app, "/api/auth/me", {
            method: "GET",
        })

        expect(status).toBe(401)
        expect(body.success).toBe(false)
    })

    test("should fail with invalid auth token", async () => {
        const { status, body } = await request(app, "/api/auth/me", {
            method: "GET",
            headers: { Authorization: "Bearer invalid-token" },
        })

        expect(status).toBe(401)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/auth/logout", () => {
    test("should logout successfully", async () => {
        const { headers } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/logout", {
            method: "POST",
            headers,
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toBe("Logged out successfully")
    })

    test("should fail without auth token", async () => {
        const { status, body } = await request(app, "/api/auth/logout", {
            method: "POST",
        })

        expect(status).toBe(401)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/forgot-password
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/auth/forgot-password", () => {
    test("should send reset email for registered user", async () => {
        const userData = createUserData()
        await request(app, "/api/auth/register", { method: "POST", body: userData })

        const { status, body } = await request(app, "/api/auth/forgot-password", {
            method: "POST",
            body: { email: userData.email },
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toContain("Password reset instructions")
    })

    test("should fail for unregistered email", async () => {
        const { status, body } = await request(app, "/api/auth/forgot-password", {
            method: "POST",
            body: { email: "notexist@example.com" },
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
    })

    test("should fail validation with invalid email", async () => {
        const { status, body } = await request(app, "/api/auth/forgot-password", {
            method: "POST",
            body: { email: "not-an-email" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/auth/validate-reset-token
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/auth/validate-reset-token", () => {
    test("should fail when token query param is missing", async () => {
        const { status, body } = await request(app, "/api/auth/validate-reset-token?email=test@example.com", {
            method: "GET",
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
    })

    test("should fail when email query param is missing", async () => {
        const { status, body } = await request(app, "/api/auth/validate-reset-token?token=sometoken", {
            method: "GET",
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
    })

    test("should fail with invalid token", async () => {
        const { status, body } = await request(
            app,
            "/api/auth/validate-reset-token?email=test@example.com&token=invalidtoken",
            { method: "GET" }
        )

        expect(status).toBe(400)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/reset-password
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/auth/reset-password", () => {
    test("should fail with invalid reset token", async () => {
        const { status, body } = await request(app, "/api/auth/reset-password", {
            method: "POST",
            body: { token: "invalid-token", newPassword: "newpassword123" },
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
    })

    test("should fail validation without token", async () => {
        const { status, body } = await request(app, "/api/auth/reset-password", {
            method: "POST",
            body: { newPassword: "newpassword123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })

    test("should fail validation with short password", async () => {
        const { status, body } = await request(app, "/api/auth/reset-password", {
            method: "POST",
            body: { token: "sometoken", newPassword: "123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// Full Auth Flow Integration Test
// ═══════════════════════════════════════════════════════════════════════════

describe("Full Auth Flow", () => {
    test("Register → Login → Me → Refresh → Logout", async () => {
        const userData = createUserData()

        // 1. Register
        const registerRes = await request(app, "/api/auth/register", {
            method: "POST",
            body: userData,
        })
        expect(registerRes.status).toBe(201)

        // 2. Login
        const loginRes = await request(app, "/api/auth/login", {
            method: "POST",
            body: { email: userData.email, password: userData.password },
        })
        expect(loginRes.status).toBe(200)
        const { accessToken, refreshToken } = loginRes.body.data

        // 3. Get profile
        const meRes = await request(app, "/api/auth/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        expect(meRes.status).toBe(200)
        expect(meRes.body.data.email).toBe(userData.email)

        // 4. Refresh token
        const refreshRes = await request(app, "/api/auth/refresh", {
            method: "POST",
            body: { refreshToken },
        })
        expect(refreshRes.status).toBe(200)
        const newAccessToken = refreshRes.body.data.accessToken

        // 5. Use new token to get profile
        const meRes2 = await request(app, "/api/auth/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${newAccessToken}` },
        })
        expect(meRes2.status).toBe(200)

        // 6. Logout
        const logoutRes = await request(app, "/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${newAccessToken}` },
        })
        expect(logoutRes.status).toBe(200)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/auth/profile
// ═══════════════════════════════════════════════════════════════════════════

describe("PUT /api/auth/profile", () => {
    test("should update profile details successfully", async () => {
        const { headers } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/profile", {
            method: "PUT",
            headers,
            body: { name: "Updated Profile Name", email: "updatedprofile@example.com" },
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toBe("Profile updated successfully")
        expect(body.data.name).toBe("Updated Profile Name")
        expect(body.data.email).toBe("updatedprofile@example.com")
    })

    test("should fail with duplicate email", async () => {
        const { headers } = await registerAndLogin(app)
        
        // register user 2
        const user2Data = createUserData()
        await request(app, "/api/auth/register", { method: "POST", body: user2Data })

        // try to change user 1's email to user 2's email
        const { status, body } = await request(app, "/api/auth/profile", {
            method: "PUT",
            headers,
            body: { name: "Updated Name", email: user2Data.email },
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
        expect(body.message).toBe("Email already in use")
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/auth/password
// ═══════════════════════════════════════════════════════════════════════════

describe("PUT /api/auth/password", () => {
    test("should update password successfully when old password matches", async () => {
        const { headers } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/password", {
            method: "PUT",
            headers,
            body: { oldPassword: "password123", newPassword: "newsecurepassword" },
        })

        expect(status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.message).toBe("Password updated successfully")
    })

    test("should fail to update password when old password does not match", async () => {
        const { headers } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/password", {
            method: "PUT",
            headers,
            body: { oldPassword: "wrongpassword", newPassword: "newsecurepassword" },
        })

        expect(status).toBe(400)
        expect(body.success).toBe(false)
        expect(body.message).toBe("Invalid old password")
    })

    test("should fail validation with short password", async () => {
        const { headers } = await registerAndLogin(app)

        const { status, body } = await request(app, "/api/auth/password", {
            method: "PUT",
            headers,
            body: { oldPassword: "password123", newPassword: "123" },
        })

        expect(status).toBe(422)
        expect(body.success).toBe(false)
    })
})
