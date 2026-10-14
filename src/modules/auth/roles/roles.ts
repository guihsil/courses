import { Ability, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import type { Models } from '@/prisma/schema';

type Perfis = {
    professorId?: string,
    coordenadorId?: string,
    alunoId?: string
    cursoId?: string
}

export type AppAbility = Ability<[string, 'all' | Subjects<{
    Usuario: Models.public_User,
    Curso: Models.public_Curso,
    Inscricoes: Models.public_Inscricoes,
    Matricula: Models.public_Matricula,
    Modulo: Models.public_Modulo
}>], PrismaQuery>;

export default function defineAbilityFor(user: Models.public_User, perfil: Perfis) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    can('update', 'Usuario', { userId: user.id });
    can('read', 'Curso', { userId: user.id }); 
    can('read', 'Modulo', { userId: user.id });
    
    if (user.cargo.includes('COORDENADOR')) {
        can('create', 'Curso', { coordenadorId: perfil.coordenadorId });
        can('update', 'Curso', { coordenadorId: perfil.coordenadorId });
        can('delete', 'Curso', { coordenadorId: perfil.coordenadorId });

        can('create', 'Modulo', { cursoId: { coordenadorId: perfil.coordenadorId } });
        can('update', 'Modulo', { cursoId: { coordenadorId: perfil.coordenadorId } });
        can('delete', 'Modulo', { cursoId: { coordenadorId: perfil.coordenadorId } });
    } 

    if (user.cargo.includes('PROFESSOR')) {
        can('update', 'Modulo', { cursoId: { professorId: perfil.professorId } });
    }
    
    if (user.cargo.includes('ALUNO')) {
        can('create', 'Inscricoes', { cursoId: { alunoId: perfil.alunoId } });
        can('read', 'Inscricoes', { cursoId: { alunoId: perfil.alunoId } });
        can('update', 'Inscricoes', { cursoId: { alunoId: perfil.alunoId } });
        cannot('delete', 'Inscricoes');

        can('create', 'Matricula', { alunoId: perfil.alunoId });
    }

    if (user.cargo.includes('ADMINISTRADOR')) {
        can('manage', 'all');
    }

    return build();
}