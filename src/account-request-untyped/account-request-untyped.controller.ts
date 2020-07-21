import { Controller, Get } from "@nestjs/common";
import { AccountRequestUntypedService } from './account-request-untyped.service';
import { stdDateFormat } from "src/dates/dates.constants";
import { AccountRequestDto } from "./account-request-untyped.interfaces";

@Controller('account-requests-untyped')
export class AccountRequestUntypedController {
    constructor(private readonly service: AccountRequestUntypedService) { }

    @Get()
    async getAccountApplications(): Promise<AccountRequestDto[]> {
        const applications = await this.service.getAccountRequests()
        return applications.map(application => { return { ...application, date: application.date.format(stdDateFormat) } });
    }

}
