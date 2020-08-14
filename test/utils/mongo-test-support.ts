import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { Test } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";

export class ProtoMongoTestSupport {
    mongoServer: MongoMemoryServer;
    mongoDirectConnection: MongoClient;
    memoryMongoUri: string;

    async init() {
        this.mongoServer = new MongoMemoryServer();
        this.memoryMongoUri = await this.mongoServer.getConnectionString();
        this.mongoDirectConnection = await MongoClient.connect(
            this.memoryMongoUri, { useNewUrlParser: true, useUnifiedTopology: true }
        );
    }

    async clearData() {
        const collections = await this.mongoDirectConnection.db().collections();

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }

    async clear() {
        await this.clearData();
        await this.addTestData();
    }

    async addTestData() {
        return Promise.resolve();
    }

    async stop() {
        await this.mongoDirectConnection.close();
        await this.mongoServer.stop();
    }
}

export abstract class MongoTestSupport extends ProtoMongoTestSupport {
    abstract modules()
}


export async function createTestApp<T extends MongoTestSupport>(testSupportClass: { new(): T }) {
    const testSupport = new testSupportClass();
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
    return { testApp, testSupport };
}

