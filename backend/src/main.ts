import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "@/app.module";
import { HttpExceptionFilter } from "@/common/filters/http-exception.filter";
import { PrismaService } from "@/prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const logger = new Logger("Bootstrap");
  const config = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  app.useLogger(logger);
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix(config.getOrThrow<string>("app.apiPrefix"));
  app.enableCors({
    origin: config.get<string[]>("app.corsOrigins"),
    credentials: true
  });

  if (config.get<boolean>("swagger.enabled")) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Circular Finder API")
      .setDescription("Production-grade backend for Circular Finder. Know how it’s made. Know how it fits. Know your impact.")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${config.getOrThrow<string>("app.apiPrefix")}/docs`, app, document);
  }

  await prisma.enableShutdownHooks(app);

  const port = config.getOrThrow<number>("app.port");
  await app.listen(port);
  logger.log(`Circular Finder backend is running on port ${port}`);
}

void bootstrap();
