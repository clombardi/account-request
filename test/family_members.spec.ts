import { FamilyMembers, familySize } from "../src/utils/object_utils"

describe('Family size', () => {
    it('children and nieces', () => {
        const standardFamily: FamilyMembers = {
            children: 8,
            nephewsNieces: 4
        }
        expect(familySize(standardFamily)).toBe(12);
    });

    it('complete family', () => {
        const completeFamily: FamilyMembers = {
            children: 8,
            nephewsNieces: 4,
            cousins: 7
        }
        expect(familySize(completeFamily)).toBe(19);
    });

    it('empty family', () => {
        const emptyFamily: FamilyMembers = {}
        expect(familySize(emptyFamily)).toBe(0);
    });
});
