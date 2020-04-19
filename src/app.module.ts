import { Module } from '@nestjs/common';
import { AccountRequestModule } from './account-request/account-request.module';
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    AccountRequestModule, 
    MongooseModule.forRoot(
      'mongodb://localhost/accountRequestTs', { useNewUrlParser: true, useUnifiedTopology: true }
    )
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
