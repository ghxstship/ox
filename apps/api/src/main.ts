// OX API bootstrap. Plug in. Level up.
// Supabase access token → RLS: the guard resolves the token into req.session and
// attaches req.accessToken, and every scoped handler runs its DB work through a
// per-request Supabase client (supa.forUser(token)) so the RLS policies filter
// rows. Capabilities are the verb boundary; RLS is the row boundary.
import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import * as swaggerUi from "swagger-ui-express";
import { AppModule } from "./app.module";
import { loadOpenApi } from "./docs/openapi";

const PREFIX = "api/v1";

async function bootstrap(): Promise<void> {
  const log = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Capture the raw body for the Stripe webhook signature check.
    rawBody: true,
    bodyParser: true,
  });

  app.setGlobalPrefix(PREFIX);
  app.use(helmet());
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(",") ?? true,
    credentials: true,
  });

  // `rawBody: true` (NestFactory option) populates req.rawBody on every request,
  // so the Stripe webhook can verify the signature against the unparsed body.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger UI from the contract-source-of-truth YAML.
  const spec = loadOpenApi();
  if (spec) {
    app.use(`/${PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "OX Platform API" }));
    log.log(`Docs at /${PREFIX}/docs`);
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  log.log(`OX API listening on :${port} (prefix /${PREFIX})`);
}

void bootstrap();
