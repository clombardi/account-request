import { Module } from '@nestjs/common';
import { AccountApplicationModule } from './account-application/account-application.module';
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    AccountApplicationModule, 
    MongooseModule.forRoot(
      'mongodb://localhost/accountApplicationJs', { useNewUrlParser: true, useUnifiedTopology: true }
    )
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
