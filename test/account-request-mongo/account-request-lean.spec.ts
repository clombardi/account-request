import { INestApplication } from "@nestjs/common";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequest } from "../../src/account-request/interfaces/account-request.interfaces";
import { AccountRequestMongoTestSupport, findByCustomerFor, createTestApp } from "./account-request-test-support";


describe('Account request service - with and without lean', () => {
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

    it('test resources exist', async () => {
        expect(testApp).toBeDefined();
        expect(mongoTestSupport).toBeDefined();
    });

    it('no-lean - get test data through service', async () => {
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
