import { INestApplication } from "@nestjs/common";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequest } from "../../src/account-request/interfaces/account-request.interfaces";
import { findByCustomerFor } from "../account-request/account-request-test-support";
import { AccountRequestMongoTestSupport } from "./account-request-test-support";
import { createTestApp } from "../utils/mongo-test-support";


describe('Account request service - using lean the bad way', () => {
    let testApp: INestApplication;
    let testSupport: AccountRequestMongoTestSupport;

    beforeAll(async () => {
        ({ testApp, testSupport } = await createTestApp(AccountRequestMongoTestSupport));
    });

    beforeEach(async () => {
        await testSupport.clear();
    })

    afterAll(async () => {
        await testApp.close();
        await testSupport.stop();
    });

    it('lean - get test data through service', async () => {
        const accountRequestService = testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequestsLean({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = findByCustomerFor(obtainedRequests);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
        const lanteri = findByCustomer("Julieta Lanteri") as AccountRequest;
        expect(lanteri.month).toBe(3);
        expect(lanteri.isDecided).toBeTruthy();
        const larrauri = findByCustomer("Juanita Larrauri") as AccountRequest;
        expect(larrauri.month).toBe(7);
        expect(larrauri.isDecided).toBeFalsy();
    });

});
