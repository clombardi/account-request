import moment = require("moment");
import { Collection } from "mongodb";
import { stdDateFormat } from "../../src/dates/dates.constants";
import { Status } from "../../src/enums/status";
import { AccountRequestModule } from "../../src/account-request/account-request.module";
import { MongoTestSupport } from "../utils/mongo-test-support";

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
