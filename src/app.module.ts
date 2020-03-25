import { Module } from '@nestjs/common';
import { AccountRequestModule } from './account-request/account-request.module';

@Module({
  imports: [AccountRequestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
