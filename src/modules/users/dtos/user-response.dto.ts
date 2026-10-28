import { User } from "../entity/user.entity";

export interface UserResponseDTO {
    id: string;
    nomeCompleto: string;
    email: string;
}

export function toUserResponse(user: User): UserResponseDTO {
    return {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
    };
}