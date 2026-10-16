import { Request, NextFunction } from 'express';
import defineAbilityFor from '@/config/permissions/roles';

export function verifyUserAbility(req: Request, next: NextFunction) {
    if(req.user && req.perfis){
        req.ability = defineAbilityFor(req.user, req.perfis);
    }

    return next();
} 