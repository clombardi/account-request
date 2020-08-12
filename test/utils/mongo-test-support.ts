import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

export class MongoTestSupport {
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