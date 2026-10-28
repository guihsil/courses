import type { AppAbility, Perfis } from "@/config/permissions/roles";
import type { User } from "@/generated/prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: User;
            ability?: AppAbility;
            perfis?: Perfis;
            auth?: { userId: string };
        }
    }
}

export {};