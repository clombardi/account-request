import { MongoMemoryServer } from "mongodb-memory-server";
import { Test } from "@nestjs/testing";
import { INestApplication, Type } from "@nestjs/common";
import { Connection } from "mongoose";
import { MongooseModule } from "@nestjs/mongoose";



export class TestDataService {
    constructor(
        readonly connection: Connection
    ) { }

    async clearData(): Promise<void> {
        const collections = this.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
}


export abstract class ModuleTestSupport<T extends TestDataService> {
    public mongoServer: MongoMemoryServer;
    public memoryMongoUri: string;
    public testApp: INestApplication;

    async init() {
        this.mongoServer = new MongoMemoryServer();
        this.memoryMongoUri = await this.mongoServer.getConnectionString();

        const testAppModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(
                    this.memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
                )
            ].concat(this.modules()),
            providers: [this.testServiceClass()]
        }).compile();

        this.testApp = testAppModule.createNestApplication();
        await this.testApp.init();
    }

    testService(): T {
        return this.testApp.get(this.testServiceClass());
    }

    abstract modules();

    abstract testServiceClass(): Type<T>;

    async clear() {
        await this.testService().clearData();
        await this.addTestData();
    }

    async stop() {
        await this.testApp.close();
        await this.mongoServer.stop();
    }

    abstract async addTestData();
}

