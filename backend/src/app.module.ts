import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import configuration from "@/config/configuration";
import { validateEnvironment } from "@/config/validation";
import { PrismaModule } from "@/prisma/prisma.module";
import { AppController } from "@/app.controller";
import { AuthModule } from "@/modules/auth/auth.module";
import { UsersModule } from "@/modules/users/users.module";
import { RolesModule } from "@/modules/roles/roles.module";
import { PermissionsModule } from "@/modules/permissions/permissions.module";
import { ProfilesModule } from "@/modules/profiles/profiles.module";
import { SocialModule } from "@/modules/social/social.module";
import { MarketplaceModule } from "@/modules/marketplace/marketplace.module";
import { OrdersModule } from "@/modules/orders/orders.module";
import { BrandsModule } from "@/modules/brands/brands.module";
import { ComplianceModule } from "@/modules/compliance/compliance.module";
import { GovernanceModule } from "@/modules/governance/governance.module";
import { ImpactModule } from "@/modules/impact/impact.module";
import { ScannerModule } from "@/modules/scanner/scanner.module";
import { CircularIdModule } from "@/modules/circular-id/circular-id.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { AnalyticsModule } from "@/modules/analytics/analytics.module";
import { FilesModule } from "@/modules/files/files.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { SuppliersModule } from "@/modules/suppliers/suppliers.module";
import { WardrobeModule } from "@/modules/wardrobe/wardrobe.module";
import { StylingModule } from "@/modules/styling/styling.module";
import { PassportsModule } from "@/modules/passports/passports.module";
import { AiAgentsModule } from "@/modules/ai-agents/ai-agents.module";
import { EnterpriseModule } from "@/modules/enterprise/enterprise.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120
      }
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = new URL(configService.getOrThrow<string>("redis.url"));
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379)
          }
        };
      }
    }),
    JwtModule.register({}),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ProfilesModule,
    SocialModule,
    MarketplaceModule,
    OrdersModule,
    BrandsModule,
    ComplianceModule,
    GovernanceModule,
    ImpactModule,
    ScannerModule,
    CircularIdModule,
    NotificationsModule,
    AnalyticsModule,
    FilesModule,
    SettingsModule,
    SuppliersModule,
    WardrobeModule,
    StylingModule,
    PassportsModule,
    AiAgentsModule,
    EnterpriseModule
  ],
  controllers: [AppController]
})
export class AppModule {}
