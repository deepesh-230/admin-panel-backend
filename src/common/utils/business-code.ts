import { BadRequestException } from '@nestjs/common';

const CODE_PATTERN = /^[A-Z0-9_]+$/;

/** Trim, uppercase, and validate business codes (e.g. PHY, AMB_GOVT). */
export function normalizeBusinessCode(
  raw: string | null | undefined,
  options?: { required?: boolean; field?: string },
): string | null {
  const field = options?.field || 'code';
  const required = options?.required ?? false;
  const value = (raw ?? '').trim().toUpperCase();

  if (!value) {
    if (required) {
      throw new BadRequestException(`${field} is required`);
    }
    return null;
  }

  if (!CODE_PATTERN.test(value)) {
    throw new BadRequestException(
      `${field} must use uppercase letters, numbers, and underscores only (e.g. PD, AMB_GOVT)`,
    );
  }

  return value;
}
