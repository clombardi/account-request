// import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test, TestingModule } from '@nestjs/testing';
import * as moment from 'moment';
import { AccountRequestModule } from '../../src/account-request/account-request.module';
import { stdDateFormat } from '../../src/dates/dates.constants';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountRequestService } from '../../src/account-request/account-request.service';
import { Status } from '../../src/enums/status';
import { AccountRequestProposal } from '../../src/account-request/interfaces/account-request.interfaces';
import { INestApplication } from '@nestjs/common';

describe('Account request service', () => {
    let testApp: INestApplication;
    let testAppModule: TestingModule;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = new MongoMemoryServer();
        const memoryMongoUri = await mongoServer.getConnectionString();

        testAppModule = await Test.createTestingModule({
            imports: [
                AccountRequestModule,
                MongooseModule.forRoot(
                    memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
                )
            ],
            exports: [
                AccountRequestModule
            ]
        }).compile();

        testApp = testAppModule.createNestApplication();
        await testApp.init();
    })

    it('gets back what was put in', async () => {
        const accountRequestService = testAppModule.get(AccountRequestService);
        const requestData: AccountRequestProposal = { 
            customer: 'Lucía Galluzo', status: Status.ANALYSING, 
            date: moment.utc('2020-02-26', stdDateFormat), requiredApprovals: 3
        };
        const firstId: string = await accountRequestService.addAccountRequest(requestData);

        const obtainedRequests = await accountRequestService.getAccountRequests({})
        expect(obtainedRequests.length).toBe(1);
        expect(obtainedRequests[0].id).toEqual(firstId);
    });

    afterAll(async () => {
        await testApp.close();
        await mongoServer.stop();
    })
});
