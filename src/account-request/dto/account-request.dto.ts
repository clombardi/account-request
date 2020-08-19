import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Status } from "src/enums/status"

export class AccountRequestProposalDTO {
    @ApiProperty({
        description: 'Customer full name',
        example: 'Juana Molina'
    })
    customer: string

    @ApiProperty({ enum: Status })
    status: string

    @ApiProperty()
    date: string

    @ApiPropertyOptional()
    requiredApprovals: number
}

export class AccountRequestDTO extends AccountRequestProposalDTO {
    @ApiProperty()
    id: string

    @ApiProperty()
    month: number

    @ApiProperty()
    isDecided: boolean
}

export interface AddResponseDTO {
    id: string
}