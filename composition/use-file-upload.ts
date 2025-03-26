import { useModelLoaderService } from "@/common/composition/use-model-loader-service";
import type { Model } from "@/common/types/types";
import { deleteFileExtension } from "@/common/utils";
import {
  ClusterModel,
  DeviceTypeModel,
  ProductPICSModel,
} from "@/common/models/domain.model";
import { ModelType } from "@/common/types/enums";
import { getErrorMessageWithSourceName } from "@/common/utils/error-message";
import { useToastService } from "@/common/composition/use-toast-service";

export interface IFileUploadService {
  convertFilesToModels(files: File[]): Promise<Model[]>;
}

export function useFileUploadService(): IFileUploadService {
  const modelLoaderService = useModelLoaderService();
  const toastService = useToastService();

  const convertFilesToModels = async (files: File[]): Promise<Model[]> => {
    const filesText = await Promise.all(files.map((file) => file.text()));

    const resultFromFiles = await modelLoaderService.loadFromXmls(filesText);

    const resultWithName = resultFromFiles.map((item, index) => ({
      ...item,
      fileName: deleteFileExtension(files[index].name),
    }));

    const warns = resultWithName
      .filter((x) => !!x.warn)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((x) => ({ warn: x.warn!, fileName: x.fileName }));
    for (const warn of warns) {
      const errorMessage = `${getErrorMessageWithSourceName(
        warn.warn,
        warn.fileName,
        "Warn:"
      )}`;
      toastService.showWarning(errorMessage);
    }

    const errors = resultWithName
      .filter((x) => !!x.error)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((x) => ({ error: x.error!, fileName: x.fileName }));
    for (const error of errors) {
      const errorMessage = `${getErrorMessageWithSourceName(
        error.error,
        error.fileName
      )}`;
      toastService.showError(errorMessage);
    }

    const modelsWithName = resultWithName
      .filter((x) => !!x.model)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((x) => ({ ...x.model!, fileName: x.fileName }));
    const clusters = modelsWithName.filter(
      (item) => item.type === ModelType.Cluster
    );
    const deviceTypes = modelsWithName.filter(
      (x) => x.type === ModelType.DeviceType
    );
    const productPICSes = modelsWithName.filter(
      (x) => x.type === ModelType.ProductPICS
    );
    const sortedModels = [...clusters, ...deviceTypes, ...productPICSes]; // Device types depends on clusters, so clusters should be uploaded first

    const preparedModels = sortedModels.map((model) => {
      if (model.type === ModelType.Cluster) {
        return new ClusterModel(model.fileName, model.data);
      }
      if (model.type === ModelType.DeviceType) {
        return new DeviceTypeModel(model.fileName, model.data);
      }
      if (model.type === ModelType.ProductPICS) {
        return new ProductPICSModel(model.fileName, model.data);
      }
      throw new Error("not implemented");
    });
    return preparedModels as Model[];
  };

  return {
    convertFilesToModels,
  };
}
