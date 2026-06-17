import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AppDataSource } from './config/database'
import { serveStatic } from 'hono/bun'
import { swaggerUI } from '@hono/swagger-ui'
import api from './routes/api'
import { ApiResponse } from './core/helpers/response'
import { BaseException, ValidationException } from './core/exceptions/base'
import { ZodError } from 'zod'
import { config } from './config/config'
import { logError } from './core/helpers/logger'

const app = new Hono()

// CORS
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Database Connection
AppDataSource.initialize()
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection error", err))

// Application Routes
app.route('/api', api)

// Swagger UI
app.get('/api/swagger.yaml', serveStatic({ path: './swagger.yaml' }))
app.get('/api/docs', swaggerUI({ url: '/api/swagger.yaml' }))

// Static Files
app.get('/api/uploads/*', (c, next) => {
    return serveStatic({ 
        root: './public', 
        path: c.req.path.replace(/^\/api/, '') 
    })(c, next)
})

// Global Error Handler
app.onError((err, c) => {
    if (err instanceof ZodError) {
        const valErr = new ValidationException(err)
        return ApiResponse.error(c, valErr.message, valErr.status, valErr.context)
    }

    if (err instanceof BaseException) {
        return ApiResponse.error(c, err.message, err.status, err.context)
    }

    // Log 500 errors to file
    logError(err, { method: c.req.method, path: c.req.path })

    const errors = config.app.env !== "production" ? { 
        message: err.message, 
        stack: err.stack 
    } : null

    return ApiResponse.error(c, "Internal Server Error", 500, errors)
})

export default {
  port: config.app.port,
  fetch: app.fetch,
};
