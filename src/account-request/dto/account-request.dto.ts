import { ApiProperty } from "@nestjs/swagger"

export class AccountRequestProposalDTO {
    @ApiProperty()
    customer: string

    @ApiProperty()
    status: string

    @ApiProperty()
    date: string

    @ApiProperty()
    requiredApprovals: number
}

export class AccountRequestDTO extends AccountRequestProposalDTO {
    id: string
    month: number
    isDecided: boolean
}

export interface AddResponseDTO {
    id: string
}