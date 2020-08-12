import { INestApplication } from "@nestjs/common";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestController } from "../../src/account-request/account-request.controller";
import { Status } from "../../src/enums/status";
import { AccountRequestMongoTestSupport } from "./account-request-test-support";
import { findByCustomerFor } from "../account-request/account-request-test-support";
import { createTestApp } from "../utils/mongo-test-support";

describe('Account request service - using mongo connection', () => {
    let testApp: INestApplication;
    let testSupport: AccountRequestMongoTestSupport;

    beforeAll(async () => {
        ({ testApp, testSupport } = await createTestApp(AccountRequestMongoTestSupport));
        // mongoTestSupport = new AccountRequestMongoTestSupport();
        // testApp = await createTestApp(mongoTestSupport);
    });

    beforeEach(async () => {
        await testSupport.clear();
    })

    afterAll(async () => {
        await testApp.close();
        await testSupport.stop();
    });

    it('get test data through service', async () => {
        const accountRequestService = testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = findByCustomerFor(obtainedRequests);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
    });

    it('get test data through controller', async () => {
        const accountRequestController = testApp.get(AccountRequestController);
        const obtainedRequests = await accountRequestController.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = findByCustomerFor(obtainedRequests);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
    });

    it('check filters', async () => {
        const undecidedRequests = await testSupport.mongoDirectConnection.db().collection('accountrequests').find(
            { $or: [{ status: Status.ANALYSING }, { status: Status.PENDING }] }
        ).toArray();
        expect(undecidedRequests.length).toBe(2);
    });

});
