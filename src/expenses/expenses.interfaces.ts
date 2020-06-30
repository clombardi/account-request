import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, MinLength, IsDefined, Matches } from 'class-validator';

export class AddExpenseRequestDTO {
    @IsDefined({ message: 'Una fecha hay que poner che' }) @IsNotEmpty() @Matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, {message: 'No cumple el formato de fecha'})
    expenseDate: string
    @IsNotEmpty()
    responsible: string
    @IsOptional() @IsString() @MinLength(5)
    description: string
    @IsNumber() @Min(0)
    amount: number
}

export class AddExpenseResponseDTO {
    newAmount: number
}