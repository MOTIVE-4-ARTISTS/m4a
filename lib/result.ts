// Server Actions return `Result<T, E>` instead of throwing so the client
// receives a fully-typed discriminated union it can render directly. Errors
// crossing the boundary as thrown exceptions surface in Next.js as opaque
// "Internal Server Error" digests, which is useless for a donor or applicant
// who needs to know whether to retry or call us. See
// .cursor/rules/010-typescript.mdc.

export type ActionError = {
  readonly code: string;
  readonly message: string;
};

export type Result<T, E = ActionError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function actionError(code: string, message: string): ActionError {
  return { code, message };
}

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok;
}

export function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return !r.ok;
}
