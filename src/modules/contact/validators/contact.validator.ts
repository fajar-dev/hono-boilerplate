import { z } from "zod"

export const CreateContactValidator = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format").optional(),
    phone: z.string().optional(),
})

export type CreateContactValidator = z.infer<typeof CreateContactValidator>

export const UpdateContactValidator = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.email("Invalid email format").optional(),
    phone: z.string().optional(),
})

export type UpdateContactValidator = z.infer<typeof UpdateContactValidator>
