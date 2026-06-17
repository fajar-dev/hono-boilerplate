import { Contact } from "../entities/contact.entity"

export class ContactSerializer {
    static single(contact: Contact) {
        return {
            id: contact.id,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
        }
    }

    static collection(contacts: Contact[]) {
        return contacts.map(c => this.single(c))
    }
}
