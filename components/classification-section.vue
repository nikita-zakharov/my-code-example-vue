<template>
  <div>
    <div class="flex items-center justify-between">
      <DataSectionHeader
        @button-click="
          emits('edit', {
            name: EditorFormContainerName.Classification,
            params: { modelId: props.modelId },
          })
        "
      >
        Classification
      </DataSectionHeader>
    </div>
    <div class="border-b px-3 py-4">
      <div class="grid grid-cols-4 gap-4">
        <div
          v-tooltip.top="{
            value: validationErrors.id || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.id,
          }"
          :class="validationErrors.id && errorClass"
        >
          <div class="model-viewer-label">ID</div>
          <div class="model-viewer-text">
            {{ identification.id }}
          </div>
        </div>
        <div
          v-tooltip.top="{
            value: validationErrors.name || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.name,
          }"
          :class="validationErrors.name && errorClass"
        >
          <div class="model-viewer-label">Name</div>
          <div class="model-viewer-text">
            {{ identification.name }}
          </div>
        </div>
        <div
          v-if="classification"
          v-tooltip.top="{
            value: validationErrors.role || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.role,
          }"
          :class="validationErrors.role && errorClass"
        >
          <div class="model-viewer-label">Role</div>
          <div class="model-viewer-text">
            {{ classification.role }}
          </div>
        </div>
        <div
          v-if="classification"
          v-tooltip.top="{
            value: validationErrors.revision || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.revision,
          }"
          :class="validationErrors.revision && errorClass"
        >
          <div class="model-viewer-label">Revision</div>
          <div class="model-viewer-text">
            {{ identification.revision }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="classification" class="mb-6 border-b px-3 py-6">
      <div class="grid grid-cols-4 gap-4">
        <div
          v-tooltip.top="{
            value: validationErrors.picsCode || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.picsCode,
          }"
          :class="validationErrors.picsCode && errorClass"
        >
          <div class="model-viewer-label">PICS Code</div>
          <div class="model-viewer-text">
            {{ classification.picsCode }}
          </div>
        </div>

        <div
          v-tooltip.top="{
            value: validationErrors.primaryTransaction || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.primaryTransaction,
          }"
          :class="validationErrors.primaryTransaction && errorClass"
        >
          <div class="model-viewer-label">Primary Transaction</div>
          <div class="model-viewer-text">
            {{ classification.primaryTransaction }}
          </div>
        </div>
        <div
          v-tooltip.top="{
            value: validationErrors.scope || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.scope,
          }"
          :class="validationErrors.scope && errorClass"
        >
          <div class="model-viewer-label">Scope</div>
          <div class="model-viewer-text">
            {{ classification.scope }}
          </div>
        </div>
        <div
          v-if="classification"
          v-tooltip.top="{
            value: validationErrors.hierarchy || tooltipPlaceholder,
            class: errorTooltipCustomClass,
            disabled: !validationErrors.hierarchy,
          }"
          :class="validationErrors.hierarchy && errorClass"
        >
          <div class="model-viewer-label">Hierarchy</div>
          <div class="model-viewer-text">
            {{ classification.hierarchy }}
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="flex items-center justify-between">
        <DataSectionHeader
          button-text="Add Cluster ID"
          :button-icon="Icons.ADD"
          @button-click="onAddAlias"
        >
          Cluster IDs
        </DataSectionHeader>
      </div>
      <SimpleTable
        :columns="aliasesColumns"
        :rows="aliases"
        confirmation-delete-title="Delete Cluster ID"
        confirmation-delete-message="Do you want to delete this cluster id?"
        class="mb-5"
        @edit="onEditAlias"
        @delete="deleteAlias"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icons } from "@/common/constants/icons";
import DataSectionHeader from "@/common/components/data-section-header/data-section-header.vue";
import SimpleTable from "@/common/components/simple-table/simple-table.vue";
import type { Alias, Cluster } from "@/common/types/types";
import { EditorFormContainerName } from "@/modules/editor/types";
import { computed, toRaw } from "vue";
import { useModelListService } from "@/common/composition/use-model-list-service";
import { useToastService } from "@/common/composition/use-toast-service";
import { useModelStore, useModelValidationStore } from "@/store";
import type { TableColumn } from "@/common/components/simple-table/table-types";
import {
  tooltipPlaceholder,
  errorTooltipCustomClass,
} from "@/common/constants/tooltip";

const errorClass = "model-viewer-error";

interface Props {
  modelId: string;
  data: Cluster;
}

const aliasesColumns: TableColumn[] = [
  {
    header: "ID",
    field: "id",
    width: "200px",
  },
  {
    header: "Name",
    field: "name",
  },
];

interface Emits {
  (
    name: "edit",
    payload:
      | {
          name: EditorFormContainerName.Classification;
          params: { modelId: string };
        }
      | {
          name: EditorFormContainerName.Alias;
          params: { modelId: string; aliasId?: string };
        }
  ): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const toastService = useToastService();
const modelListService = useModelListService();
const modelStore = useModelStore();
const modelValidationStore = useModelValidationStore();

const identification = computed(() => props.data.identification);
const classification = computed(() => props.data.classification);

const validationErrors = computed(() => {
  const getErrorMessage = (path: string) => {
    const error = modelValidationStore.getModelErrorByPath(props.modelId, path);
    return error?.error || null;
  };

  return {
    id: getErrorMessage("identification.id"),
    name: getErrorMessage("identification.name"),
    revision: getErrorMessage("identification.revision"),
    role: getErrorMessage("classification.role"),
    picsCode: getErrorMessage("classification.picsCode"),
    primaryTransaction: getErrorMessage("classification.primaryTransaction"),
    scope: getErrorMessage("classification.scope"),
    baseCluster: getErrorMessage("classification.baseCluster"),
    hierarchy: getErrorMessage("classification.hierarchy"),
  };
});

const validationErrorOriginPath = "aliases";

const aliases = computed<Alias[]>(() => {
  return (
    props.data?.aliases
      ?.map((alias, index) => {
        const invalid =
          modelValidationStore.getModelErrorsByPartOfPath(
            props.modelId,
            `${validationErrorOriginPath}.[${index}]`
          ).length > 0;
        return { ...alias, invalid };
      })
      .sort((a, b) => Number(a.id) - Number(b.id)) || []
  );
});

const onAddAlias = (): void => {
  emits("edit", {
    name: EditorFormContainerName.Alias,
    params: { modelId: props.modelId },
  });
};

const onEditAlias = (alias: Alias) => {
  emits("edit", {
    name: EditorFormContainerName.Alias,
    params: { modelId: props.modelId, aliasId: alias.id },
  });
};

const deleteAlias = async (alias: Alias): Promise<void> => {
  try {
    const model = toRaw(modelStore.getById(props.modelId));
    if (!model) return;

    const modelData = model.data as Cluster;

    if (!modelData || !modelData.aliases) return;

    modelData.aliases = modelData.aliases.filter((a) => a.id !== alias.id);
    await modelListService.update(props.modelId, model);
  } catch (e) {
    toastService.handleError(e);
  }
};
</script>
