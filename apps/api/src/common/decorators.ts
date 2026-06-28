// Route metadata decorators: @Public() opts out of auth, @Capability() gates a
// write, @CurrentSession() injects the verified session into a handler.
import {
  SetMetadata,
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { Capability as Cap } from "@ox/rbac";
import type { OxRequest, Session } from "./session";

export const IS_PUBLIC_KEY = "ox:public";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CAPABILITY_KEY = "ox:capability";
/** Require a capability (the verb boundary). RLS handles the row boundary. */
export const Capability = (cap: Cap) => SetMetadata(CAPABILITY_KEY, cap);

/** Inject the verified Session. Throws 401 if missing (should not happen post-guard). */
export const CurrentSession = createParamDecorator((_data: unknown, ctx: ExecutionContext): Session => {
  const req = ctx.switchToHttp().getRequest<OxRequest>();
  if (!req.session) throw new UnauthorizedException({ code: "unauthorized", message: "No session." });
  return req.session;
});
