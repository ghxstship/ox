import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Capability, CurrentSession } from "../common/decorators";
import type { Session } from "../common/session";
import { CheckinDto, CreateClassDto, UpdateClassDto } from "./classes.dto";
import { ClassesService } from "./classes.service";

@Controller()
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get("classes")
  list(@CurrentSession() session: Session, @Query("from") from?: string, @Query("to") to?: string) {
    return this.classes.list(session, { from, to });
  }

  @Post("classes")
  @Capability("class.manage")
  create(@CurrentSession() session: Session, @Body() dto: CreateClassDto) {
    return this.classes.create(session, dto);
  }

  @Patch("classes/:id")
  @Capability("class.manage")
  update(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: UpdateClassDto) {
    return this.classes.update(session, id, dto);
  }

  @Delete("classes/:id")
  @Capability("class.manage")
  remove(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.classes.remove(session, id);
  }

  @Post("classes/:id/book")
  @Capability("class.book")
  book(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.classes.book(session, id);
  }

  @Post("bookings/:id/cancel")
  @Capability("class.book")
  cancel(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.classes.cancel(session, id);
  }

  @Get("classes/:id/roster")
  @Capability("roster.view")
  roster(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.classes.roster(session, id);
  }

  @Post("classes/:id/checkin")
  @Capability("checkin.scan")
  checkin(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: CheckinDto) {
    return this.classes.checkin(session, id, dto);
  }
}
