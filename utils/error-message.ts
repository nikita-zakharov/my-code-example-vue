export function getErrorMessage(error: unknown, prefix = "Error:"): string {
  if (error instanceof Error) {
    return `${prefix} ${error.message}`.trim();
  }
  if (typeof error === "string") {
    return `${prefix} ${error}`.trim();
  }

  return "Error";
}

export function getErrorMessageWithSourceName(
  error: unknown,
  source: string,
  prefix = "Error:"
): string {
  let errorMessage = getErrorMessage(error);

  if (!source) return errorMessage;

  errorMessage = errorMessage.replace(prefix, `${prefix} ${source}:`);

  return errorMessage;
}
