import { INestApplication } from "@nestjs/common";
import { AccountRequestLeanModule } from "../../src/account-request-lean/account-request-lean.module";
import { AccountRequestService } from "../../src/account-request-lean/account-request-lean.service";
import { AccountRequest } from "../../src/account-request-lean/account-request-lean.interfaces";
import { findByCustomerFor } from "../account-request/account-request-test-support";
import { AccountRequestMongoTestSupport } from "./account-request-test-support";
import { createTestApp } from "../utils/mongo-test-support";

export class AccountRequestLeanMongoTestSupport extends AccountRequestMongoTestSupport {
    modules() { return [AccountRequestLeanModule] }
}


describe('Account request service - lean right way', () => {
    let testApp: INestApplication;
    let testSupport: AccountRequestMongoTestSupport;

    beforeAll(async () => {
        ({ testApp, testSupport } = await createTestApp(AccountRequestLeanMongoTestSupport));
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
        const obtainedRequests = await accountRequestService.getAccountRequests()
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
