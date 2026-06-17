import { User } from "../../user/entities/user.entity"
import minio from "../../../core/helpers/minio"

export class AuthSerializer {
    private static async resolvePhotoUrl(photo?: string | null): Promise<string | null> {
        if (!photo) return null
        return await minio.getPresignedUrl(photo)
    }

    static single(user: User) {
        return {
            id: user.id,
            name: user.name,
            photo: user.photo,
            email: user.email,
            isActive: user.isActive,
        }
    }
}
