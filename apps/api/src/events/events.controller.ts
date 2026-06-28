import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Capability, CurrentSession, Public } from "../common/decorators";
import type { Session } from "../common/session";
import { CreateEventDto, RsvpDto } from "./events.dto";
import { EventsService } from "./events.service";

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Public()
  @Get("events")
  list() {
    return this.events.list();
  }

  @Public()
  @Get("events/:id")
  get(@Param("id") id: string) {
    return this.events.get(id);
  }

  @Post("events")
  @Capability("class.manage")
  create(@CurrentSession() session: Session, @Body() dto: CreateEventDto) {
    return this.events.create(session, dto);
  }

  @Post("events/:id/rsvp")
  @Capability("raid.join")
  rsvp(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: RsvpDto) {
    return this.events.rsvp(session, id, dto);
  }

  @Post("tickets/:id/checkin")
  @Capability("checkin.scan")
  checkin(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.events.checkin(session, id);
  }
}
