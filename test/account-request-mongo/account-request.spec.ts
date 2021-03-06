import { INestApplication } from "@nestjs/common";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestController } from "../../src/account-request/account-request.controller";
import { Status } from "../../src/enums/status";
import { AccountRequestMongoTestSupport } from "./account-request-test-support";
import { findByCustomerFor } from "../account-request/account-request-test-support";
import { createTestApp } from "../utils/mongo-test-support";
import { AccountRequest } from "src/account-request/interfaces/account-request.interfaces";

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

    it('test resources exist', async () => {
        expect(testApp).toBeDefined();
        expect(testSupport).toBeDefined();
    });

    it('get test data through service', async () => {
        const accountRequestService = testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = findByCustomerFor(obtainedRequests);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
        const lanteri = findByCustomer("Julieta Lanteri") as AccountRequest;
        // el casteo hace falta porque está prendido strictNullChecks
        // alternativas (además de apagar strictNullChecks)
        // - lanteri!, esto evita el chequeo
        //   https://www.typescriptlang.org/docs/handbook/advanced-types.html
        // - lanteri?, esto hace lo mismo que lanteri === undefined ? undefined : lanteri.month
        //   está disponible en TypeScript 3.7+
        //   https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html
        // - expect(lanteri ? lanteri.month : lanteri).toBe(3);
        //   esto tipa correctamente
        expect(lanteri.month).toBe(3);
        expect(lanteri.isDecided).toBeTruthy();
        const larrauri = findByCustomer("Juanita Larrauri") as AccountRequest;
        expect(larrauri.month).toBe(7);
        expect(larrauri.isDecided).toBeFalsy();
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
