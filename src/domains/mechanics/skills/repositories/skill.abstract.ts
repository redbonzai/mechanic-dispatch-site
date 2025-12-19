import { Skill } from '../interfaces';

export abstract class SkillAbstract {
  abstract findMany(): Promise<Skill[]>;
  abstract findById(id: string): Promise<Skill | null>;
}

export const SKILL_REPOSITORY = Symbol('SKILL_REPOSITORY');
