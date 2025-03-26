<template>
  <Toast position="bottom-right" />
  <div>
    <ConfirmDialog :draggable="false" />
    <DynamicDialog />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import Toast from "primevue/toast";
import DynamicDialog from "primevue/dynamicdialog";
import ConfirmDialog from "primevue/confirmdialog";
import { onMounted } from "vue";
import { useModelListService } from "@/common/composition/use-model-list-service";
import { upgradeModelStorage } from "@/common/composition/use-model-storage-service";
import {
  defaultViewMode,
  useDeviceTypeStore,
  useModelStore,
  useModelValidationStore,
  useTabStore,
} from "@/store";
import { useToastService } from "@/common/composition/use-toast-service";
import { ModelType } from "@/common/types/enums";
import type { Cluster, DeviceType, Model } from "@/common/types/types";
import { getOrderedKeysFromCluster } from "@/modules/editor/cluster/cluster-data-order/utils";
import { useClusterOrderUpdater } from "@/modules/editor/cluster/cluster-data-order/use-cluster-order-updater";
import { getOrderedKeysFromDeviceType } from "@/modules/editor/device-type/device-type-data-order/utils";
import { useDeviceTypeOrderUpdater } from "@/modules/editor/device-type/device-type-data-order/use-device-type-order-updater";

const modelStore = useModelStore();
const deviceTypeStore = useDeviceTypeStore();
const tabStore = useTabStore();
const modelListService = useModelListService();
const modelValidationStore = useModelValidationStore();
const toastService = useToastService();
const clusterOrderUpdater = useClusterOrderUpdater();
const deviceTypeOrderUpdater = useDeviceTypeOrderUpdater();

async function initModelList() {
  const models = await modelListService.getAll();
  modelStore.setModels(models);
}

async function init() {
  const upgradeResult = await upgradeModelStorage();
  for (const modelName in upgradeResult) {
    const model = upgradeResult[modelName];
    if (model.warns?.length) {
      toastService.showWarning(
        `Upgrading model ${modelName}: ${model.warns.join(", ")}`
      );
    }
    if (model.errors?.length) {
      toastService.showError(
        `Upgrading model ${modelName}: ${model.errors.join(", ")}`
      );
    }
  }

  initModelList();
}

function initDeviceTypeViewMode(modelId: string) {
  deviceTypeStore.updateViewMode(modelId, defaultViewMode);
}

function removeDeviceTypeViewMode(modelId: string) {
  deviceTypeStore.removeViewMode(modelId);
}

async function initClusterDataOrder(model: Model) {
  const orderedKeys = getOrderedKeysFromCluster(model.data as Cluster);
  await clusterOrderUpdater.updateOrders(model, orderedKeys);
}

async function initDeviceTypeDataOrder(model: Model) {
  const orderedKeys = getOrderedKeysFromDeviceType(model.data as DeviceType);
  await deviceTypeOrderUpdater.updateOrders(model, orderedKeys);
}

onMounted(async () => {
  await init();
  modelListService.addChangeListener(async (_, args) => {
    const model = args.id ? await modelListService.get(args.id) : null;

    switch (args.event) {
      case "add":
        if (!model) return;
        modelStore.add(model);
        if (model.type === ModelType.DeviceType) {
          initDeviceTypeViewMode(model.id);
          await initDeviceTypeDataOrder(model);
        }
        if (model.type === ModelType.Cluster) {
          await initClusterDataOrder(model);
        }
        break;
      case "update":
        if (!model) return;
        modelStore.update(model.id, model);
        modelValidationStore.resetErrors(model.id);
        break;
      case "delete":
        if (!args.id) return;
        modelStore.remove(args.id);
        removeDeviceTypeViewMode(args.id);
        break;
      case "clear":
        modelStore.clear();
        break;
    }
  });
  modelStore.$subscribe((_, state) => {
    tabStore.synchronizeModels(state.models);
  });
});
</script>
