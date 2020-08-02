import { defaultTo } from 'lodash';

export interface FamilyMembers {
    children?: number,
    nephewsNieces?: number,
    cousins?: number
}

export interface FamilySize {
    totalFamilySize: number
}
export function familySize(family: FamilyMembers): number {
    return defaultTo(family.children, 0) + defaultTo(family.nephewsNieces, 0) + defaultTo(family.cousins, 0)
    // return family.children + family.nephewsNieces + family.cousins
}

export function familySizeAsObject(family: FamilyMembers): FamilySize {
    return { totalFamilySize: familySize(family) }
}