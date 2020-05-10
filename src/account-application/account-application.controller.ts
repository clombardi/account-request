import { Controller, Get, Post, Body } from '@nestjs/common';
import * as moment from 'moment';

import { AccountApplicationService } from './account-application.service';
import { GetAccountApplicationsDto, AddResponseDto, AccountApplicationDto } from './dto/account-application.dto';
import { AccountApplication, dateStringFormat } from './interfaces/account-application.interfaces';
import { Status } from 'src/enums/status';

@Controller('account-applications')
export class AccountApplicationController {
    constructor(private readonly service: AccountApplicationService) { }

    @Get()
    async getAccountApplications(): Promise<GetAccountApplicationsDto> {
        const applications = await this.service.getAccountApplications()
        return applications.map(application => { return { ...application, date: application.date.format(dateStringFormat) } });
    }

    @Post()
    async addAccountApplication(@Body() newApplicationData: AccountApplicationDto): Promise<AddResponseDto> {
        const newApplication: AccountApplication = {
            ...newApplicationData, 
            date: moment(newApplicationData.date, dateStringFormat), status: newApplicationData.status as Status
        }
        const newId = await this.service.addAccountApplication(newApplication)
        return { id: newId }
    }
}
