import { useToast } from "primevue/usetoast";

const toastLifeTime = 10000;

export function checkErrorType(error: unknown): error is Error {
  if (typeof error !== "object" || !error) {
    return false;
  }
  // eslint-disable-next-line no-prototype-builtins
  return error.hasOwnProperty("message");
}

interface IToastService {
  showSuccess(message: string): void;
  showWarning(message: string): void;
  showError(message: string): void;
  handleError(error: unknown): void;
}

export function useToastService(): IToastService {
  const { add } = useToast();
  const showSuccess = (detail: string): void => {
    add({ severity: "success", detail, closable: true, life: toastLifeTime });
  };

  const showWarning = (detail: string): void => {
    add({ severity: "warn", detail, closable: true, life: toastLifeTime });
  };

  const showError = (detail: string): void => {
    add({ severity: "error", detail, closable: true, life: toastLifeTime });
  };

  const handleError = (error: unknown): void => {
    const fallbackMessage =
      "Something went wrong. Please, contact with technical support.";

    if (!checkErrorType(error)) {
      add({
        severity: "error",
        detail: fallbackMessage,
        closable: true,
        life: toastLifeTime,
      });

      return;
    }

    add({
      severity: "error",
      detail: error.message ?? fallbackMessage,
      closable: true,
      life: toastLifeTime,
    });
  };

  return {
    showSuccess,
    showWarning,
    showError,
    handleError,
  };
}
