export abstract class ApplicationException extends Error {
  abstract readonly codeError: number;
}
