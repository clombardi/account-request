import { Test, TestingModule } from "@nestjs/testing";
import moment = require("moment");
import { Status } from "../../src/enums/status";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestController } from "../../src/account-request/account-request.controller";
import { AccountRequestProposal, AccountRequest } from "../../src/account-request/interfaces/account-request.interfaces";
import { stdDateFormat } from "../../src/dates/dates.constants";
import { AccountRequestTestSupport } from "./account-request-test-support";
import { findByCustomerFor, findSureByCustomerFor } from "../account-request/account-request-test-support";

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

    it('get test data through service', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = findByCustomerFor(obtainedRequests);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
    });

    it('get test data through controller', async () => {
        const accountRequestController = testSupport.testApp.get(AccountRequestController);
        const obtainedRequests = await accountRequestController.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = findByCustomerFor(obtainedRequests);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
    });

    it('gets back what was put in', async () => {
        const accountRequestService = testSupport.testApp.get(AccountRequestService);
        const requestData: AccountRequestProposal = {
            customer: 'Lucía Galluzo', status: Status.ANALYSING,
            date: moment.utc('2020-02-26', stdDateFormat), requiredApprovals: 3
        };
        const newId: string = await accountRequestService.addAccountRequest(requestData);

        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(6);
        const lucia = findSureByCustomerFor(obtainedRequests)('Lucía Galluzo');
        expect(lucia.id).toEqual(newId);
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
    // const undecidedRequests = await testService().accountRequestModel.find({ isDecided: false })

    it('check filters', async () => {
        // const undecidedRequests = await testService().accountRequestModel.find(
        //     { status: {$in: [Status.ANALYSING, Status.PENDING]} }
        // )
        const undecidedRequests = await testSupport.testService().accountRequestModel.find(
            { $or: [{ status: Status.ANALYSING }, { status: Status.PENDING }] }
        )
        expect(undecidedRequests.length).toBe(2);
    });

});



const fakeAccountRequestService = {
    getAccountRequests: (): AccountRequest[] => {
        return [{
            id: '41',
            customer: '33445566778',
            status: Status.PENDING,
            date: moment.utc("2020-01-22", stdDateFormat),
            requiredApprovals: 4,
            month: 1,
            isDecided: false
        }]
    }
}


describe('Account request service - service mock', () => {
    it('gets country info', async () => {
        const testModule: TestingModule = await Test.createTestingModule({
            controllers: [AccountRequestController],
            providers: [AccountRequestService],
        })
            .overrideProvider(AccountRequestService)
            .useValue(fakeAccountRequestService)
            .compile();

        const theController = testModule.get(AccountRequestController);
        const theData = await theController.getAccountRequests({});
        expect(theData).toEqual([{
            id: '41',
            customer: '33445566778',
            status: Status.PENDING,
            date: "2020-01-22",
            requiredApprovals: 4,
            month: 1,
            isDecided: false
        }]);
    });
});
