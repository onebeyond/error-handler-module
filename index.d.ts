import { Request, Response, NextFunction, Errback } from 'express';

export enum CustomErrorTypes {
  BAD_REQUEST= 'bad_request',
  FORBIDDEN= 'forbidden',
  NOT_FOUND= 'not_found',
  SWAGGER_INPUT_VALIDATOR= 'swagger_input_validator',
  SWAGGER_OUTPUT_VALIDATOR= 'swagger_output_validator',
  SWAGGER_VALIDATOR= 'swagger_validator',
  OAS_VALIDATOR= 'OpenAPIUtilsError:response',
  UNAUTHORIZED= 'unauthorized',
  WRONG_INPUT= 'wrong_input',
}

declare class CustomError {
  constructor(type: CustomErrorTypes, message: any, extra: any);
  name: CustomErrorTypes | string;
  type: CustomErrorTypes | string;
  message: any;
  extra: any;
}

export function errorFactory(errorType: CustomErrorTypes | string): (message: string, extra?: any) => CustomError;

type UserLogger = {
  error: (message: string) => void
};

type MetricException = {
  err: Error
};

type Metric = {
  trackException: (exception: MetricException) => void
};

export function handleHttpError(logger: UserLogger, metrics?: Metric): (err: Errback, req: Request, res: Response, next: NextFunction) => void;

type OptionalTypes = {
  [type: CustomErrorTypes | string]: string
}
export function tagError(err: unknown, newTypes?: OptionalTypes): CustomError;
