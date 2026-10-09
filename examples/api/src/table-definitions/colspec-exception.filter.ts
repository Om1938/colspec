import { ContractError } from '@colspec/core';
import {
  DefinitionNotFoundError,
  RevisionPublishedError,
} from '@colspec/server';
import {
  Catch,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

type ColspecError =
  ContractError | DefinitionNotFoundError | RevisionPublishedError;

/** Translates colspec's errors into HTTP responses in one place. */
@Catch(ContractError, DefinitionNotFoundError, RevisionPublishedError)
export class ColspecExceptionFilter implements ExceptionFilter<ColspecError> {
  catch(error: ColspecError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (error instanceof ContractError) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Invalid request', diagnostics: error.diagnostics });
    }
    const status =
      error instanceof DefinitionNotFoundError
        ? HttpStatus.NOT_FOUND
        : HttpStatus.CONFLICT;
    return response.status(status).json({ error: error.message });
  }
}
