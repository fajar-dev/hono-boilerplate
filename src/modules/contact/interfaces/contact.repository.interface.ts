import { EntityManager } from "typeorm"
import { Contact } from "../entities/contact.entity"

export interface IContactRepository {
    findAll(page: number, limit: number, q: string): Promise<{ data: Contact[]; total: number }>
    findById(id: number): Promise<Contact | null>
    save(data: Partial<Contact>, manager?: EntityManager): Promise<Contact>
    merge(entity: Contact, data: Partial<Contact>): Contact
    delete(id: number): Promise<void>
}
