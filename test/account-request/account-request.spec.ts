import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test, TestingModule } from '@nestjs/testing';
import * as moment from 'moment';
import { AccountRequestModule } from '../../src/account-request/account-request.module';
import { stdDateFormat } from '../../src/dates/dates.constants';
import { MongooseModule, InjectModel, InjectConnection } from '@nestjs/mongoose';
import { AccountRequestService } from '../../src/account-request/account-request.service';
import { Status } from '../../src/enums/status';
import { AccountRequestProposal, AccountRequest, AccountRequestMongoose, AccountRequestMongooseData } from '../../src/account-request/interfaces/account-request.interfaces';
import { AccountRequestProposalDTO } from '../../src/account-request/dto/account-request.dto';
import { INestApplication, Injectable } from '@nestjs/common';
import { AccountRequestController } from '../../src/account-request/account-request.controller';
import { Model, Connection } from 'mongoose';


@Injectable()
class TestDataService {
    constructor(
        @InjectModel('AccountRequest') private accountRequestModel: Model<AccountRequestMongoose>,
        @InjectConnection() private readonly connection: Connection 
    ) {}

    async addAccountRequest(req: AccountRequestProposalDTO): Promise<string> {
        const dataForMongoose: AccountRequestMongooseData = {
            customer: req.customer,
            status: req.status,
            date: moment(req.date, stdDateFormat).valueOf(),
            requiredApprovals: req.requiredApprovals
        }
        const newMongooseRequest = new this.accountRequestModel(dataForMongoose)
        await newMongooseRequest.save()
        return newMongooseRequest._id
    }

    async clearData(): Promise<void> {
        const collections = this.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
}


describe('Account request service', () => {
    let testApp: INestApplication;
    let mongoServer: MongoMemoryServer;

    const testService = () => testApp.get(TestDataService);
    const clearData = async () => {
        await testService().clearData();
    }
    const addTestAccountRequest = async (customer: string, status: string, date: string, requiredApprovals = 3) => {
        await testService().addAccountRequest({ customer, status, date, requiredApprovals })
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

        const testAppModule = await Test.createTestingModule({
            imports: [
                AccountRequestModule,
                MongooseModule.forRoot(
                    memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
                )
            ],
            providers: [TestDataService]
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

    it('gets back what was put in', async () => {
        const accountRequestService = testApp.get(AccountRequestService);
        const requestData: AccountRequestProposal = { 
            customer: 'Lucía Galluzo', status: Status.ANALYSING, 
            date: moment.utc('2020-02-26', stdDateFormat), requiredApprovals: 3
        };
        const newId: string = await accountRequestService.addAccountRequest(requestData);

        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(6);
        const lucia = (obtainedRequests.find(req => req.customer === 'Lucía Galluzo')) as AccountRequest;
        expect(lucia.id).toEqual(newId);
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
