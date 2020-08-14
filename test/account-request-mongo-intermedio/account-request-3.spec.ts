import { INestApplication } from "@nestjs/common";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { AccountRequestController } from "../../src/account-request/account-request.controller";
import { Status } from "../../src/enums/status";
import { findByCustomerFor } from "../account-request/account-request-test-support";
import { MongoTestSupport } from "../utils/mongo-test-support";
import { Collection } from "mongodb";
import moment = require("moment");
import { stdDateFormat } from "src/dates/dates.constants";
import { AccountRequestModule } from "src/account-request/account-request.module";
import { Test } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";







export class AccountRequestMongoTestSupport extends MongoTestSupport {
    async addTestAccountRequest(customer: string, status: string, dateAsString: string, requiredApprovals = 3) {
        const collection: Collection = await this.mongoDirectConnection.db().collection('accountrequests');
        await collection.insertOne({
            customer, status, requiredApprovals, date: moment(dateAsString, stdDateFormat).valueOf()
        });
    }

    async addTestData() {
        await this.addTestAccountRequest("Juana Molina", Status.ACCEPTED, "2020-04-08", 8)
        await this.addTestAccountRequest("Pedro Almodóvar", Status.REJECTED, "2020-06-15", 2)
        await this.addTestAccountRequest("Juana Azurduy", Status.PENDING, "2020-06-12", 4)
        await this.addTestAccountRequest("Julieta Lanteri", Status.ACCEPTED, "2020-03-23")
        await this.addTestAccountRequest("Juanita Larrauri", Status.ANALYSING, "2020-07-19", 6)
    }

    modules() { return [AccountRequestModule] }
}



export async function createTestApp(testSupport: MongoTestSupport) {
    await testSupport.init();

    const testAppModule = await Test.createTestingModule({
        imports: [
            MongooseModule.forRoot(
                testSupport.memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
            )
        ].concat(testSupport.modules())
    }).compile();

    const testApp = testAppModule.createNestApplication();
    await testApp.init();
    return testApp;
}


describe('Account request service - using mongo connection', () => {
    let testApp: INestApplication;
    let testSupport: AccountRequestMongoTestSupport;

    beforeAll(async () => {
        testSupport = new AccountRequestMongoTestSupport();
        testApp = await createTestApp(testSupport);
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
