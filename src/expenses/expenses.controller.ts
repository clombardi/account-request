import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AddExpenseResponseDTO, AddExpenseRequestDTO } from './expenses.interfaces';

@Controller('expenses')
export class ExpensesController {

    // @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
    @Post()
    @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
    addExpense(@Body() expenseData: AddExpenseRequestDTO): AddExpenseRequestDTO {
        return {...expenseData, amount: expenseData.amount + 1 }
    }

    @Post('/check')
    @UsePipes(new ValidationPipe())
    checkExpense(@Body() expenseData: AddExpenseRequestDTO): AddExpenseResponseDTO {
        return { newAmount: expenseData.amount + 1 }
    }


}

