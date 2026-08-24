import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CmsModule } from './cms/cms.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DashboardModule } from './dashboard/dashboard.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { KeywordsModule } from './keywords/keywords.module';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceProvidersModule } from './service-providers/service-providers.module';
import { StateAdminsModule } from './state-admins/state-admins.module';
import { StatesModule } from './states/states.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    EnquiriesModule,
    ListingsModule,
    StatesModule,
    StateAdminsModule,
    CategoriesModule,
    CmsModule,
    SubcategoriesModule,
    KeywordsModule,
    UsersModule,
    ServiceProvidersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
