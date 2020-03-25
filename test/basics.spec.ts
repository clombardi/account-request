describe('Object literal notation', () => {
    it('should access components', () => {
        const accountRequest = {
            customer: '33445566778',
            status: 'Pending',
            date: '2020-01-22'
        }
        expect(accountRequest.status).toBe('Pending');
    });
});
