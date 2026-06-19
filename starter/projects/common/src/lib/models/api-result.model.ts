export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Uniform envelope returned by every API call. No raw HttpErrorResponse should
 * escape the data layer — interceptors map failures into this shape.
 */
export interface ApiResult<T = void> {
  isSuccess: boolean;
  data?: T;
  failure?: {
    message: string;
    validationErrors?: ValidationError[];
  };
}

/** Extracts the most useful error message from an API failure. */
export function getFailureMessage(failure?: {
  message?: string;
  validationErrors?: ValidationError[];
}): string | undefined {
  if (!failure) {
    return undefined;
  }

  const errors = failure.validationErrors;

  if (errors?.length) {
    return errors.map((error) => error.message).join('\n');
  }

  return failure.message;
}
