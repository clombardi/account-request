import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AgencySchema } from "./agency.interface";
import { AgencyController } from "./agency.controller";
import { AgencyService } from "./agency.service";

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'agencies', schema: AgencySchema }
    ])],
    controllers: [AgencyController],
    providers: [AgencyService]
})
export class AgencyModule { }
