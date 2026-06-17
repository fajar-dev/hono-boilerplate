import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../modules/user/entities/user.entity"
import { Contact } from "../modules/contact/entities/contact.entity"
import { config } from "./config"

/**
 * TypeORM Database Configuration
 * Uses centralized config from config.ts
 */
export const AppDataSource = new DataSource({
    type: config.database.type,
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.pass,
    database: config.database.name,
    synchronize: config.database.sync,
    entities: [User, Contact],
    migrations: [],
    subscribers: [],
})
