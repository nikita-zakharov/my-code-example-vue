import { useConfirm } from "primevue/useconfirm";

interface Params {
  title: string;
  message: string;
  closeButtonVisible?: boolean;
  closeButtonTitle?: string;
  onClose?: () => void;
}

const defaultParams = {
  title: "Information",
  message: "Message",
  closeButtonTitle: "Ok",
  closeButtonVisible: true,
};

export const useInformationDialog = ({
  title,
  message,
  closeButtonTitle,
  closeButtonVisible,
  onClose,
}: Params) => {
  const dialog = useConfirm();

  const open = () => {
    dialog.require({
      header: title || defaultParams.title,
      message: message || defaultParams.message,
      rejectClass: "hidden",
      acceptClass:
        closeButtonVisible || defaultParams.closeButtonVisible
          ? "p-button-text"
          : "hidden",
      acceptLabel: closeButtonTitle || defaultParams.closeButtonTitle,
      accept: onClose,
    });
  };

  return { open, close: dialog.close };
};
