import moment = require("moment");
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { stdDateFormat } from "../../src/dates/dates.constants";
import { Status } from "../../src/enums/status";
import { AccountRequestMassiveAdditionDTO } from "../../src/account-request/interfaces/account-request.interfaces";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestController } from "../../src/account-request/account-request.controller";
import { AccountRequestTestSupport } from "./account-request-test-support";
import { findSureByCustomerFor, findByCustomerFor } from "../account-request/account-request-test-support";


const massiveAdditionData: AccountRequestMassiveAdditionDTO = {
    date: '2020-08-04', defaultRequiredApprovals: 6, 
    requestDetails: [ 
        { customer: 'Rómulo Berruti', requiredApprovals: 4 }, 
        { customer: 'Ramona Galarza' },
        { customer: 'Elsa Franco', requiredApprovals: 2 }
    ]
}

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
        const resultOfDeletion = await accountRequestService.deleteAccountRequest(String(juanaA.id));

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
        await expect(accountRequestService.deleteAccountRequest(String(julieta.id))).rejects.toThrow(ForbiddenException);
    });

    it('delete - non-existent id', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        // el string tiene que ser un hexa de 24 caracteres. Como se calcula a partir del timestamp, todos 0 no puede ser
        // una opción más sofisticada es asignar a mano los ids a los objetos que se crean
        await expect(accountRequestService.deleteAccountRequest("000000000000000000000000")).rejects.toThrow(NotFoundException);
    });
    
    it('delete - malformed id', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        // el string tiene que ser un hexa de 24 caracteres. Como se calcula a partir del timestamp, todos 0 no puede ser
        // una opción más sofisticada es asignar a mano los ids a los objetos que se crean
        await expect(accountRequestService.deleteAccountRequest("xxx")).rejects.toThrow(BadRequestException);
    });

    it('massive addition', async () => {
        const accountRequestController = testSupport.testApp.get(AccountRequestController);
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        const serviceResult = await accountRequestController.accountRequestMassiveAddition(massiveAdditionData);
        const additionDay = moment.utc(massiveAdditionData.date, stdDateFormat);
        expect(serviceResult.addedRequestsCount).toBe(3);
        const requestsAfter = await accountRequestService.getAccountRequests({});
        expect(requestsAfter.length).toBe(8);
        const findByCustomer = findSureByCustomerFor(requestsAfter);
        const romulo = findByCustomer('Rómulo Berruti');
        expect(romulo.requiredApprovals).toBe(4);
        expect(romulo.date.valueOf()).toEqual(additionDay.valueOf());
        const ramona = findByCustomer('Ramona Galarza');
        expect(ramona.requiredApprovals).toBe(6);
        expect(ramona.status).toEqual(Status.PENDING);
    })

    // este no anda
    it.skip('delete - accepted request cannot be deleted - 2', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        // the account request for Julieta Lanteri is accepted, hence it should not be deleted
        const obtainedRequests = await accountRequestService.getAccountRequests({ customer: 'Julieta Lanteri' });
        const julieta = obtainedRequests[0];
        expect(async () => await accountRequestService.deleteAccountRequest(julieta.id)).toThrow(ForbiddenException);
    });
});



