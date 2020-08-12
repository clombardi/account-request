import { MongoMemoryServer } from "mongodb-memory-server";
import { Test } from "@nestjs/testing";
import { Injectable, INestApplication } from "@nestjs/common";
import { InjectModel, InjectConnection, MongooseModule } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";
import moment = require("moment");
import { AccountRequestMongoose, AccountRequestMongooseData } from "../../src/account-request/interfaces/account-request.interfaces";
import { AccountRequestProposalDTO } from "../../src/account-request/dto/account-request.dto";
import { stdDateFormat } from "../../src/dates/dates.constants";
import { AccountRequestModule } from "../../src/account-request/account-request.module";
import { Status } from "../../src/enums/status";

@Injectable()
export class TestDataService {
    constructor(
        @InjectModel('AccountRequest') public accountRequestModel: Model<AccountRequestMongoose>,
        @InjectConnection() private readonly connection: Connection
    ) { }

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


export class AccountRequestTestSupport {
    public mongoServer: MongoMemoryServer;
    public memoryMongoUri: string;
    public testApp: INestApplication;
    
    async init() {
        this.mongoServer = new MongoMemoryServer();
        this.memoryMongoUri = await this.mongoServer.getConnectionString();

        const testAppModule = await Test.createTestingModule({
            imports: [
                AccountRequestModule,
                MongooseModule.forRoot(
                    this.memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
                )
            ],
            providers: [TestDataService]
        }).compile();

        this.testApp = testAppModule.createNestApplication();
        await this.testApp.init();
    }

    testService() {
        return this.testApp.get(TestDataService);
    }

    async clear() {
        await this.testService().clearData();
        await this.addTestData();
    }

    async stop() {
        await this.testApp.close();
        await this.mongoServer.stop();
    }

    async addTestData() {
        await this.addTestAccountRequest("Juana Molina", Status.ACCEPTED, "2020-04-08", 8)
        await this.addTestAccountRequest("Pedro Almodóvar", Status.REJECTED, "2020-06-15", 2)
        await this.addTestAccountRequest("Juana Azurduy", Status.PENDING, "2020-06-12", 4)
        await this.addTestAccountRequest("Julieta Lanteri", Status.ACCEPTED, "2020-03-24")
        await this.addTestAccountRequest("Juanita Larrauri", Status.ANALYSING, "2020-07-19", 6)
    }

    async addTestAccountRequest(customer: string, status: string, date: string, requiredApprovals = 3) {
        await this.testService().addAccountRequest({ customer, status, date, requiredApprovals });
    }
}