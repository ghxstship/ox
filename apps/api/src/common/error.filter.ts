// Global error filter — every error leaves as the single OpenAPI `Error`
// envelope: { code, message, details? }.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { ApiError } from "@ox/types";
import type { Response } from "express";

const STATUS_CODE: Record<number, string> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "unprocessable",
  429: "rate_limited",
  500: "internal",
};

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly log = new Logger("OxError");

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.toEnvelope(exception, status);
    if (status >= 500) this.log.error(body.message, exception instanceof Error ? exception.stack : undefined);
    res.status(status).json(body);
  }

  private toEnvelope(exception: unknown, status: number): ApiError {
    const fallbackCode = STATUS_CODE[status] ?? "error";
    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      if (typeof resp === "string") return { code: fallbackCode, message: resp };
      if (resp && typeof resp === "object") {
        const r = resp as Record<string, unknown>;
        // Already an envelope?
        if (typeof r.code === "string" && typeof r.message === "string") {
          return { code: r.code, message: r.message, details: r.details as ApiError["details"] };
        }
        // Nest ValidationPipe / default shape: { message, error, statusCode }
        const message = Array.isArray(r.message) ? r.message.join("; ") : String(r.message ?? exception.message);
        const details = Array.isArray(r.message) ? { errors: r.message } : undefined;
        return { code: fallbackCode, message, details };
      }
    }
    return {
      code: fallbackCode,
      message: exception instanceof Error ? exception.message : "Unexpected error.",
    };
  }
}
