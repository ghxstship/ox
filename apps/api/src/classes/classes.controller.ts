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
import { Capability, CurrentSession, CurrentToken } from "../common/decorators";
import type { Session } from "../common/session";
import { CheckinDto, CreateClassDto, UpdateClassDto } from "./classes.dto";
import { ClassesService } from "./classes.service";

@Controller()
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get("classes")
  list(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.classes.list(session, token, { from, to });
  }

  @Post("classes")
  @Capability("class.manage")
  create(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: CreateClassDto) {
    return this.classes.create(session, token, dto);
  }

  // Recurring class builder (11 §B #30): expand a series' recurRule into
  // occurrences. `?persist=1` materializes them as concrete Class rows.
  @Post("classes/:id/occurrences")
  @Capability("class.manage")
  occurrences(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Param("id") id: string,
    @Query("count") count?: string,
    @Query("persist") persist?: string,
  ) {
    return this.classes.occurrences(session, token, id, {
      count: count ? Number(count) : undefined,
      persist: persist === "1" || persist === "true",
    });
  }

  @Patch("classes/:id")
  @Capability("class.manage")
  update(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Param("id") id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classes.update(session, token, id, dto);
  }

  @Delete("classes/:id")
  @Capability("class.manage")
  remove(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.classes.remove(session, token, id);
  }

  @Post("classes/:id/book")
  @Capability("class.book")
  book(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.classes.book(session, token, id);
  }

  @Post("bookings/:id/cancel")
  @Capability("class.book")
  cancel(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.classes.cancel(session, token, id);
  }

  @Get("classes/:id/roster")
  @Capability("roster.view")
  roster(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.classes.roster(session, token, id);
  }

  @Post("classes/:id/checkin")
  @Capability("checkin.scan")
  checkin(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Param("id") id: string,
    @Body() dto: CheckinDto,
  ) {
    return this.classes.checkin(session, token, id, dto);
  }
}
