import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, MinLength, IsDefined, Matches, Allow, IsEnum } from 'class-validator';

export enum Gente { Pepe = 'Pepe', Juana = 'Juana', Luisa = 'Luisa' }

export class AddExpenseRequestDTO {
    @IsDefined({ message: 'Una fecha hay que poner che' }) 
    @Matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, {message: 'No cumple el formato de fecha'})
    expenseDate: string
    @IsNotEmpty({ message: 'Es obligatorio indicar un responsable' })
    responsible: string
    @IsOptional() @IsString() @MinLength(5)
    description: string
    @IsNumber() @Min(0)
    amount: number
    @Allow()
    comments: string
}

export class AddExpenseResponseDTO {
    newAmount: number
}