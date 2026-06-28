import { Module } from "@nestjs/common";
import { ConsumerModule } from "../consumer/consumer.module";
import { CommerceController } from "./commerce.controller";
import { CommerceService } from "./commerce.service";

@Module({ imports: [ConsumerModule], controllers: [CommerceController], providers: [CommerceService] })
export class CommerceModule {}
