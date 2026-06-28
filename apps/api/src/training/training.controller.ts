import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Capability, CurrentSession, Public } from "../common/decorators";
import type { Session } from "../common/session";
import { GenerateWorkoutDto, LogSetDto, StartWorkoutDto } from "./training.dto";
import { TrainingService } from "./training.service";

@Controller()
export class TrainingController {
  constructor(private readonly training: TrainingService) {}

  @Public()
  @Get("exercises")
  exercises(
    @Query("q") q?: string,
    @Query("muscle") muscle?: string,
    @Query("equipment") equipment?: string,
  ) {
    return this.training.exercises({ q, muscle, equipment });
  }

  @Post("workouts/generate")
  @Capability("workout.log")
  generate(@Body() dto: GenerateWorkoutDto) {
    return this.training.generate(dto);
  }

  @Post("workouts")
  @Capability("workout.log")
  start(@CurrentSession() session: Session, @Body() dto: StartWorkoutDto) {
    return this.training.start(session, dto);
  }

  @Post("workouts/:id/sets")
  @Capability("workout.log")
  logSet(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: LogSetDto) {
    return this.training.logSet(session, id, dto);
  }

  @Post("workouts/:id/finish")
  @Capability("workout.log")
  finish(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.training.finish(session, id);
  }
}
