import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestTestSupport } from "./account-request-test-support";
import { findSureByCustomerFor, findByCustomerFor } from "../account-request/account-request-test-support";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

describe('Account request service', () => {
    let testSupport: AccountRequestTestSupport;

    beforeAll(async () => {
        testSupport = new AccountRequestTestSupport();
        await testSupport.init();
    });

    beforeEach(async () => {
        await testSupport.clear();
    })

    afterAll(async () => {
        await testSupport.stop();
    });


    it('get with no result', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequests({customer: 'Tutu'})
        expect(obtainedRequests.length).toBe(0)
    });

    it('massive update', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        const modified = await accountRequestService.massiveIncrementRequiredApprovals();

        expect(modified).toBe(2);
        const obtainedRequests = await accountRequestService.getAccountRequests({})
        const findByCustomer = findSureByCustomerFor(obtainedRequests);
        expect(findByCustomer('Pedro Almodóvar').requiredApprovals).toBe(2);
        expect(findByCustomer('Juana Azurduy').requiredApprovals).toBe(5);
    });

    it('delete - happy case', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequests({ customer: 'Juana Azurduy'});
        const juanaA = obtainedRequests[0];
        const resultOfDeletion = await accountRequestService.deleteAccountRequest(juanaA.id);

        expect(resultOfDeletion).toEqual(juanaA);

        // obtain again account request, should be just four of them
        const obtainedRequestsAfter = await accountRequestService.getAccountRequests({});
        expect(obtainedRequestsAfter.length).toBe(4);
        const findByCustomer = findByCustomerFor(obtainedRequestsAfter);
        expect(findByCustomer('Pedro Almodóvar')).toBeDefined();
        expect(findByCustomer('Juana Azurduy')).toBeUndefined();
    });

    it('delete - accepted request cannot be deleted', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        // the account request for Julieta Lanteri is accepted, hence it should not be deleted
        const obtainedRequests = await accountRequestService.getAccountRequests({ customer: 'Julieta Lanteri' });
        const julieta = obtainedRequests[0];
        // esto lo practicamos al ver test de controller
        await expect(accountRequestService.deleteAccountRequest(julieta.id)).rejects.toThrow(ForbiddenException);
    });

    it('delete - non-existent id', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        // el string tiene que ser un hexa de 24 caracteres. Como se calcula a partir del timestamp, todos 0 no puede ser
        // una opción más sofisticada es asignar a mano los ids a los objetos que se crean
        await expect(accountRequestService.deleteAccountRequest("000000000000000000000000")).rejects.toThrow(NotFoundException);
    });

    // este no anda
    it.skip('delete - accepted request cannot be deleted - 2', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        // the account request for Julieta Lanteri is accepted, hence it should not be deleted
        const obtainedRequests = await accountRequestService.getAccountRequests({ customer: 'Julieta Lanteri' });
        const julieta = obtainedRequests[0];
        expect(async () => await accountRequestService.deleteAccountRequest(julieta.id)).toThrow(ForbiddenException);
    });
});



