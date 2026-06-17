import { User } from "../../user/entities/user.entity"

export class AuthSerializer {
    static single(user: User) {
        return {
            id: user.id,
            name: user.name,
            photo: user.photo,
            email: user.email,
            isActive: user.isActive,
        }
    }

    static collection(users: User[]) {
        return users.map(u => this.single(u))
    }
}
