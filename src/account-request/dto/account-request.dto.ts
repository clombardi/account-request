import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Status } from "src/enums/status"
import { idApiDocSpec } from '../account-request.constants';

export class AccountRequestProposalDTO {
    @ApiProperty({
        description: 'Customer full name',
        example: 'Juana Molina'
    })
    customer: string

    @ApiProperty({ description: 'Status of the request', enum: Status, example: Status.ACCEPTED })
    status: string

    @ApiProperty({ 
        description: 'Date in which the request was recorded', 
        type: 'date', format: 'YYYY-MM-DD', example: '2020-07-01'
    })
    date: string

    @ApiPropertyOptional({ 
        description: 'How many positive opininos are required to approve the request', 
        type: 'number', minimum: 2, maximum: 1000, example: 5, default: 3
    })
    requiredApprovals: number
}

export class AccountRequestDTO extends AccountRequestProposalDTO {
    @ApiProperty(idApiDocSpec())
    id: string

    @ApiProperty({ description: 'month of request record, 1-based (ie, January is 1)', type: 'number', example: 5 })
    month: number

    @ApiProperty({ 
        description: 'whether a decision (approval or rejection) has been taken for this request', 
        type: 'boolean', example: false
    })
    isDecided: boolean
}

export class AddResponseDTO {
    @ApiProperty(idApiDocSpec('for the just-added request'))
    id: string
}