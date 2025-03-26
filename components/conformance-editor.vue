<template>
  <VDialog
    title="Conformance"
    :visible="editorVisible"
    :breakpoints="{ '960px': '90vw' }"
    :style="{ width: '50vw' }"
    @close="closeEditor"
  >
    <StringFormField
      v-model="form.conformance"
      :label="FormFieldLabel.Conformance"
      :has-error="!!v$.conformance.$errors.length"
    />
    <div v-if="v$.conformance.$invalid" class="mt-5">
      <Panel toggleable header="Conformance is invalid" :collapsed="hideError">
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="toggle">
            <span
              :class="`pi ${hideError ? 'pi-angle-down' : 'pi-angle-up'}`"
            ></span>
          </button>
        </template>
        <small class="error-details">{{ validationErrorsString }}</small>
      </Panel>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeEditor"
      />
      <Button
        label="Ok"
        icon="pi pi-check"
        class="p-button-text"
        @click="onOk"
      />
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import VDialog from "@/common/components/dialog/v-dialog.vue";
import Button from "primevue/button";
import Panel from "primevue/panel";
import { computed, ref } from "vue";
import StringFormField from "@/common/components/form-fields/string-form-field.vue";
import type { IForm } from "@/modules/editor/common/conformance/editor/conformance-editor.types";
import { FormFieldLabel } from "@/modules/editor/common/conformance/editor/conformance-editor.types";
import { DomainModelUtilities } from "dme-library";
import { getErrorMessage } from "@/common/utils/error-message";
import useVuelidate from "@vuelidate/core";
import type {
  Cluster,
  Conformance,
  DeviceType,
  DeviceTypeCluster,
  Model,
  ValidationError,
  ValidationResult,
} from "@/common/types/types";
import { useModelStore } from "@/store";
import { ModelType } from "@/common/types/enums";
import {
  clusterService,
  deviceTypeService,
} from "@/common/composition/container";
import { helpers } from "@vuelidate/validators";

interface Props {
  modelId: string;
  clusterId?: string;
}

interface Emits {
  (name: "ok", payload: Conformance): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const modelStore = useModelStore();
const model = computed<Model | undefined>(() =>
  modelStore.getById(props.modelId)
);

const editorVisible = ref(false);
const hideError = ref(true);

const form = ref<IForm>({
  conformance: null,
});

const validationErrors = ref<ValidationError[]>([]);

const validationErrorsString = computed(() =>
  formatErrorsToString(validationErrors.value)
);

const rules = computed(() => ({
  conformance: {
    modelValidation: helpers.withMessage(
      () => validationErrorsString.value,
      () => !validationErrors.value.length
    ),
  },
}));

const v$ = useVuelidate<IForm>(rules, form.value, {
  $autoDirty: true,
  $stopPropagation: true,
});

function formatErrorsToString(errors: ValidationError[]) {
  return errors.map((err) => err.error).join("\n");
}

const openEditor = () => {
  editorVisible.value = true;
};

const closeEditor = () => {
  editorVisible.value = false;
  validationErrors.value = [];
  v$.value.$reset();
};

const toggle = () => {
  hideError.value = !hideError.value;
};

const validateModel = (): ValidationResult | undefined => {
  if (!model.value) return;
  const conformance = DomainModelUtilities.Common.ConformanceClass.fromString(
    form.value.conformance || ""
  );
  const cluster = model.value.data as Cluster;
  const deviceTypeCluster = getDeviceTypeCluster();

  switch (model.value.type) {
    case ModelType.Cluster:
      return clusterService.validateConformance(
        {
          dataTypes: cluster.dataTypes,
          features: cluster.features?.features,
          attributes: cluster.attributes?.attributes,
        },
        conformance
      );
    case ModelType.DeviceType:
      return deviceTypeService.validateConformance(
        {
          dataTypes: deviceTypeCluster?.model.dataTypes,
          features: deviceTypeCluster?.model.features?.features.map(
            (feature) => ({
              code: feature.code,
            })
          ),
          attributes: deviceTypeCluster?.model.attributes?.attributes.map(
            (attribute) => ({
              name: attribute.name,
              type: attribute.type,
            })
          ),
        },
        conformance
      );
    default:
      return;
  }
};

const getDeviceTypeCluster = (): DeviceTypeCluster | undefined => {
  if (!model.value || !props.clusterId) return;
  const deviceType = model.value.data as DeviceType;
  const clusterIndex =
    deviceType.clusters?.clusters.findIndex((c) => c.id === props.clusterId) ??
    -1;

  return deviceType.clusters?.clusters[clusterIndex];
};

const validate = (): boolean => {
  try {
    const modelValidationResult = validateModel();
    if (modelValidationResult?.error) {
      validationErrors.value = [...modelValidationResult.error];
      v$.value.$touch();
      return false;
    }

    DomainModelUtilities.Common.ConformanceClass.fromString(
      form.value.conformance || ""
    );
    validationErrors.value = [];
    return true;
  } catch (error) {
    validationErrors.value = [
      {
        path: "conformance",
        type: "error",
        error: getErrorMessage(error, ""),
      },
    ];
    v$.value.$touch();
    return false;
  }
};

const onOk = async () => {
  const isValid = validate();
  if (!isValid) return;
  const conformance = DomainModelUtilities.Common.ConformanceClass.fromString(
    form.value.conformance || ""
  );
  emits("ok", conformance);

  closeEditor();
};

const edit = (conformance: Conformance | null) => {
  form.value.conformance = conformance?.valueString || null;

  openEditor();
};

defineExpose({
  edit,
});
</script>
<style lang="scss">
.error-details {
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  text-overflow: clip;
}

.p-panel-title {
  font-size: 80% !important;
  font-weight: 400 !important;
  color: #a80000;
}

.p-panel {
  box-shadow: none;
}

.p-panel-header,
.p-panel-content {
  padding: 0 !important;
}

div[class="p-panel-icons"] {
  > *:last-child {
    display: none;
  }
}
</style>
