import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { AgencyService } from "./agency.service"
import { AgencyDTO, Agency } from "./agency.interface";

@Controller('agencies')
export class AgencyController {
    constructor(private readonly service: AgencyService) { }

    @Get()
    async getAgencies(): Promise<AgencyDTO[]> {
        return this.service.getAgencies();
    }

    @Get(":code")
    async getAgencyByCode(@Param("code") code: string): Promise<Agency> {
        return this.service.getByCode(code);
    }

    @Get(":code/range")
    async getAgencyByCodeRange(@Param("code") code: string): Promise<Agency[]> {
        return this.service.getRangeByCode(code);
    }

    @Post("/massiveAddition")
    async agencyMassiveAddition(@Body() massiveAdditionData: AgencyDTO[]): Promise<{ addedAgenciesCount: number }> {
        return { addedAgenciesCount: await this.service.addManyAgencies(massiveAdditionData) };
    }
}