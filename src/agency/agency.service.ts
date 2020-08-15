import * as _ from 'lodash'
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AgencyMongoose, Agency, AgencyProposal } from "./agency.interface";
import { Model } from "mongoose";

function mongooseToModel(mongooseAgency: AgencyMongoose): Agency {
    return { ..._.pick(mongooseAgency, "code", "name", "address", "area"), id: mongooseAgency._id }
}

@Injectable()
export class AgencyService {
    constructor(@InjectModel('manyagency') private agencyModel: Model<AgencyMongoose>) { }

    async getAgencies(): Promise<Agency[]> {
        return (await this.agencyModel.find({})).map(mongooseToModel)
    }

    async getByCode(code: string): Promise<Agency> {
        const dbResult = (await this.agencyModel.findOne({ code }))
        if (!dbResult) {
            throw new NotFoundException(`Agency with code ${code} not found`)
        }
        return mongooseToModel(dbResult);
    }

    // async getRangeByCode(code: string): Promise<Agency[]> {
    //     const codeAsNumber = Number(code)
    //     return Promise.all(_.range(codeAsNumber, codeAsNumber + 9).map(async oneCode => {
    //         return mongooseToModel((await this.agencyModel.findOne({ code: String(oneCode) })) as AgencyMongoose)
    //     }))
    // }

    async getRangeByCode(code: string): Promise<Agency[]> {
        const agency = async code => {
            const mongooseResult = await this.agencyModel.findOne({ code }) as AgencyMongoose
            return mongooseToModel(mongooseResult)
        }

        const codeAsNumber = Number(code)
        const result: Agency[] = []
        result.push(await agency(codeAsNumber))
        result.push(await agency(codeAsNumber + 1))
        result.push(await agency(codeAsNumber + 2))
        result.push(await agency(codeAsNumber + 3))
        result.push(await agency(codeAsNumber + 4))
        result.push(await agency(codeAsNumber + 5))
        result.push(await agency(codeAsNumber + 6))
        result.push(await agency(codeAsNumber + 7))
        result.push(await agency(codeAsNumber + 8))
        result.push(await agency(codeAsNumber + 9))
        return result
    }

    async addManyAgencies(proposals: AgencyProposal[]): Promise<number> {
        const resultOfAddition = await this.agencyModel.insertMany(proposals);
        return resultOfAddition.length;
    }
}