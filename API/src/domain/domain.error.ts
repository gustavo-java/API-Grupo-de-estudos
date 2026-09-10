export type DomainErrorCode =
  'ENTITY_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'CONFLICT';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = DomainError.name;
  }
}
