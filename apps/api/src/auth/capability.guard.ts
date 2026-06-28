// Enforces @Capability('cap') — the verb boundary. 403s with the Error envelope.
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { can, type Capability } from "@ox/rbac";
import { CAPABILITY_KEY } from "../common/decorators";
import type { OxRequest } from "../common/session";

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const cap = this.reflector.getAllAndOverride<Capability>(CAPABILITY_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!cap) return true; // no capability required on this route

    const req = ctx.switchToHttp().getRequest<OxRequest>();
    if (!can(req.session ?? null, cap)) {
      throw new ForbiddenException({
        code: "forbidden",
        message: `Missing capability: ${cap}.`,
        details: { capability: cap },
      });
    }
    return true;
  }
}
