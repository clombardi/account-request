import { INestApplication } from "@nestjs/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoClient, Collection }  from "mongodb";
import { Test } from "@nestjs/testing";
import { Status } from "../../src/enums/status";
import { AccountRequestModule } from "../../src/account-request/account-request.module";
import { AccountRequestService } from "../../src/account-request/account-request.service";
import { stdDateFormat } from "../../src/dates/dates.constants";
import moment = require("moment");
import { AccountRequestController } from "../../src/account-request/account-request.controller";


describe('Account request service', () => {
    let testApp: INestApplication;
    let mongoServer: MongoMemoryServer;
    let mongoDirectConnection: MongoClient;

    const clearData = async () => {
        const collections = await mongoDirectConnection.db().collections();

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
    const addTestAccountRequest = async (
        customer: string, status: string, dateAsString: string, requiredApprovals = 3
    ) => {
        const collection: Collection = await mongoDirectConnection.db().collection('accountrequests');
        await collection.insertOne({ customer, status, requiredApprovals, date: moment(dateAsString, stdDateFormat).valueOf(),});
    }
    const addTestData = async () => {
        await addTestAccountRequest("Juana Molina", Status.ACCEPTED, "2020-04-08", 8)
        await addTestAccountRequest("Pedro Almodóvar", Status.REJECTED, "2020-06-15", 2)
        await addTestAccountRequest("Juana Azurduy", Status.PENDING, "2020-06-12", 4)
        await addTestAccountRequest("Julieta Lanteri", Status.ACCEPTED, "2020-03-24")
        await addTestAccountRequest("Juanita Larrauri", Status.ANALYSING, "2020-07-19", 6)
    }

    beforeAll(async () => {
        mongoServer = new MongoMemoryServer();
        const memoryMongoUri = await mongoServer.getConnectionString();
        mongoDirectConnection = await MongoClient.connect(
            memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
        );

        const testAppModule = await Test.createTestingModule({
            imports: [
                AccountRequestModule,
                MongooseModule.forRoot(
                    memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
                )
            ]
        }).compile();

        testApp = testAppModule.createNestApplication();
        await testApp.init();
    });

    beforeEach(async () => {
        await clearData();
        await addTestData();
    })

    afterAll(async () => {
        await testApp.close();
        await mongoDirectConnection.close();
        await mongoServer.stop();
    });

    it('get test data through service', async () => {
        const accountRequestService = testApp.get(AccountRequestService);
        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = (name) => obtainedRequests.find(req => req.customer === name);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
    });

    it('get test data through controller', async () => {
        const accountRequestController = testApp.get(AccountRequestController);
        const obtainedRequests = await accountRequestController.getAccountRequests({})
        expect(obtainedRequests.length).toBe(5);
        const findByCustomer = (name) => obtainedRequests.find(req => req.customer === name);
        expect(findByCustomer("Juana Molina")).toBeDefined();
        expect(findByCustomer("Pierina Dealessi")).toBeUndefined();
    });
});
