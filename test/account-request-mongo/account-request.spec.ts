import { INestApplication } from "@nestjs/common";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestController } from "../../src/account-request/account-request.controller";
import { AccountRequestMongoTestSupport, createTestApp } from "./account-request-test-support";
import { findByCustomerFor } from "../account-request/account-request-test-support";

describe('Account request service - using mongo connection', () => {
    let testApp: INestApplication;
    let mongoTestSupport: AccountRequestMongoTestSupport;

    beforeAll(async () => {
        ({ testApp, mongoTestSupport } = await createTestApp());
    });

    beforeEach(async () => {
        await mongoTestSupport.clear();
    })

    afterAll(async () => {
        await testApp.close();
        await mongoTestSupport.stop();
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

});
