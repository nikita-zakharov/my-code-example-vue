<template>
  <div>
    <EditorFormHeader
      :model="model"
      editable-model-part="Classification"
      @cancel="emits('close')"
      @save="onSave"
    />
    <FormScrollableContainer>
      <div class="model-form-box">
        <div class="row">
          <div class="row-item">
            <StringFormField
              v-model="form.id"
              :validation="v$.id"
              type="text"
              placeholder="Enter ID"
              label="ID"
              @blur="onIdInputBlur"
            />
          </div>
          <div class="row-item">
            <StringFormField
              v-model="form.name"
              :validation="v$.name"
              type="text"
              placeholder="Enter name"
              label="Name"
            />
          </div>
        </div>
        <div class="row">
          <div class="row-item">
            <DropdownFormField
              v-model="form.role"
              :options="roleOptions"
              :clearable="false"
              label="Role"
              :validation="v$.role"
            />
          </div>
          <div class="row-item">
            <StringFormField
              v-model="form.picsCode"
              :validation="v$.picsCode"
              type="text"
              placeholder="Enter PICS Code"
              label="PICS Code"
            />
          </div>
        </div>
        <div class="row">
          <div class="row-item">
            <DropdownFormField
              v-model="form.primaryTransaction"
              :options="primaryTransactionTypeOptions"
              label="Primary Transaction"
              :validation="v$.primaryTransaction"
            />
          </div>
          <div class="row-item">
            <StringFormField
              v-model="form.scope"
              :validation="v$.scope"
              type="text"
              placeholder="Enter scope"
              label="Scope"
            />
          </div>
        </div>
        <div class="row">
          <div class="row-item">
            <DropdownFormField
              v-model="form.hierarchy"
              :options="hierarchyOptions"
              :clearable="false"
              label="Hierarchy"
              :validation="v$.hierarchy"
            />
          </div>
          <div class="row-item">
            <StringFormField
              v-model="form.baseCluster"
              :validation="v$.baseCluster"
              :disabled="isBaseClusterDisabled"
              type="text"
              placeholder="Enter base cluster"
              label="Base cluster"
            />
          </div>
        </div>
      </div>
    </FormScrollableContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw, watch, toRefs } from "vue";
import StringFormField from "@/common/components/form-fields/string-form-field.vue";
import DropdownFormField from "@/common/components/form-fields/dropdown-form-field.vue";
import EditorFormHeader from "@/common/components/editor-form-header/editor-form-header.vue";
import {
  ClusterPrimaryTransactionType,
  ClusterRole,
  Hierarchy,
} from "@/common/types/enums";
import {
  clusterPrimaryTransactionTypes,
  clusterRoles,
  hierarhcies,
} from "@/common/constants/model";
import { useModelListService } from "@/common/composition/use-model-list-service";
import type {
  Cluster,
  ClusterClassification,
  ValidationError,
} from "@/common/types/types";
import { useToastService } from "@/common/composition/use-toast-service";
import { useModelStore } from "@/store";
import useVuelidate from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import type { IDropDownOption } from "@/common/components/form-fields/types";
import { capitalize, debounce } from "lodash";
import { useConfirmationDialog } from "@/common/composition/use-confirmation-dialog";
import { getErrorMessage } from "@/common/utils/error-message";
import FormScrollableContainer from "@/modules/editor/common/form-scrollable-container/form-scrollable-container.vue";
import type { ClassificationValidationState } from "@/modules/editor/cluster/classification/classification-validation/classification-validation.types";
import {
  getClassificationValidationState,
  validateClassification,
  validateIdentification,
} from "@/modules/editor/cluster/classification/classification-validation/classification-validation.utils";
import { validationDebounceDelayMS } from "@/common/constants/validation";
import { withRevisionWarnIgnore } from "@/common/utils/classification-validation";
import { transformIdToHex } from "@/modules/editor/cluster/utils/transform-id-to-hex";
import { getClusterIdHex } from "@/common/helpers/helpers";

interface Props {
  modelId: string;
}

interface Emits {
  (name: "close"): void;
}

interface FormState {
  id: string;
  name: string;
  picsCode: string;
  primaryTransaction?: string;
  role: ClusterRole;
  scope: string;
  baseCluster: string;
  hierarchy: Hierarchy;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const { modelId } = toRefs(props);

const modelStore = useModelStore();
const modelListService = useModelListService();
const toastService = useToastService();

const saveWithInvalidValidationConfirmationDialog = useConfirmationDialog({
  title: "Save invalid data",
  message: "Do you want to save data with invalid fields?",
  onAccept: updateModel,
});

const model = toRaw(modelStore.getById(modelId.value));
const modelData = model && (model.data as Cluster);

const aliases = modelData?.aliases || [];
const revisions = modelData?.revisionHistory?.revisions || [];

const form = ref<FormState>({
  id: "",
  name: "",
  role: ClusterRole.Application,
  picsCode: "",
  primaryTransaction: undefined,
  scope: "",
  baseCluster: "",
  hierarchy: Hierarchy.Base,
});

const isBaseClusterDisabled = computed(
  () => form.value.hierarchy !== Hierarchy.Derived && !form.value.baseCluster
);

const validationState = ref<ClassificationValidationState>(
  {} as ClassificationValidationState
);

const rules = computed(() => {
  return {
    id: {
      modelValidation: helpers.withMessage(
        () => validationState.value.id?.error || "",
        () => !validationState.value.id?.error
      ),
    },
    name: {
      modelValidation: helpers.withMessage(
        () => validationState.value.name?.error || "",
        () => !validationState.value.name?.error
      ),
    },
    role: {
      modelValidation: helpers.withMessage(
        () => validationState.value.role?.error || "",
        () => !validationState.value.role?.error
      ),
    },
    primaryTransaction: {
      modelValidation: helpers.withMessage(
        () => validationState.value.primaryTransaction?.error || "",
        () => !validationState.value.primaryTransaction?.error
      ),
    },
    picsCode: {
      modelValidation: helpers.withMessage(
        () => validationState.value.picsCode?.error || "",
        () => !validationState.value.picsCode?.error
      ),
    },
    scope: {
      modelValidation: helpers.withMessage(
        () => validationState.value.scope?.error || "",
        () => !validationState.value.scope?.error
      ),
    },
    hierarchy: {
      modelValidation: helpers.withMessage(
        () => validationState.value.hierarchy?.error || "",
        () => !validationState.value.hierarchy?.error
      ),
    },
    baseCluster: {
      modelValidation: helpers.withMessage(
        () => validationState.value.baseCluster?.error || "",
        () => !validationState.value.baseCluster?.error
      ),
    },
  };
});

const v$ = useVuelidate<FormState>(rules, form, { $autoDirty: true });

const baseCluster = computed(() => form.value.baseCluster);
const hierarchy = computed(() => form.value.hierarchy);

const roleOptions = computed<IDropDownOption[]>(() => {
  return clusterRoles.map((role) => ({ id: role, label: capitalize(role) }));
});

const hierarchyOptions = computed<IDropDownOption[]>(() => {
  return hierarhcies.map((hierarchy) => ({
    id: hierarchy,
    label: capitalize(hierarchy),
  }));
});

const primaryTransactionTypeOptions = computed<IDropDownOption[]>(() => {
  return clusterPrimaryTransactionTypes.map((type) => ({
    id: type.value.toString(),
    label: capitalize(type.key),
  }));
});

function handleBaseClusterChange(value: string) {
  if (value.length === 0) {
    form.value.hierarchy = Hierarchy.Base;
  }
}

function handleHierarchyChange(value: Hierarchy) {
  if (value === Hierarchy.Base) {
    form.value.baseCluster = "";
  }
}

async function fillForm() {
  const model = await modelListService.get(props.modelId);
  if (!model) return;

  const modelData = model.data as Cluster;

  form.value.id = modelData.identification.id;
  form.value.name = modelData.identification.name;
  form.value.role = modelData.classification.role;
  form.value.hierarchy = modelData.classification.hierarchy || "";
  form.value.picsCode = modelData.classification.picsCode;
  form.value.primaryTransaction =
    modelData.classification.primaryTransaction?.toString();
  form.value.scope = modelData.classification.scope || "";
  form.value.baseCluster = modelData.classification.baseCluster || "";
}

const debouncedValidation = debounce(validate, validationDebounceDelayMS);

function validate() {
  const preparedIdentification = prepareIdentification();
  const identificationValidationErrors = validateIdentification(
    preparedIdentification,
    aliases,
    revisions
  );

  const preparedClassification = prepareClassification();
  const classificationValidationErrors = validateClassification(
    preparedClassification
  );
  const validationErrors = identificationValidationErrors.concat(
    classificationValidationErrors
  );

  setValidationState(validationErrors);
  nextTick(() => v$.value.$touch());
  return validationErrors;
}

function setValidationState(errors: ValidationError[]) {
  const state = getClassificationValidationState(errors);

  validationState.value = { ...state };
}

function prepareIdentification() {
  return {
    id: form.value.id,
    name: form.value.name?.trim(),
    revision: modelData?.identification.revision || 0, // TODO fix
  };
}

function prepareClassification(): ClusterClassification {
  return {
    role: form.value.role,
    hierarchy: form.value.hierarchy,
    scope: form.value.scope?.trim(),
    baseCluster: form.value.baseCluster?.trim(),
    picsCode: form.value.picsCode?.trim(),
    primaryTransaction: form.value.primaryTransaction as
      | ClusterPrimaryTransactionType
      | undefined,
  };
}

function getModelWithCurrentFormData() {
  if (!model) return;
  const draftModel = toRaw(model);
  const draftModelData = draftModel && (draftModel.data as Cluster);
  if (!draftModelData) return;

  draftModelData.identification = {
    ...draftModelData.identification,
    ...prepareIdentification(),
  };
  draftModelData.classification = {
    ...draftModelData.classification,
    ...prepareClassification(),
  };

  return draftModel;
}

async function updateModel() {
  try {
    const newModel = getModelWithCurrentFormData();
    if (!newModel) return;
    await modelListService.update(props.modelId, newModel);
    close();
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    toastService.showError(errorMessage);
  }
}

function onIdInputBlur() {
  const hex = transformIdToHex(form.value.id, getClusterIdHex);
  if (!hex) return;

  form.value.id = hex;
}

async function onSave() {
  let errors = validate();
  errors = withRevisionWarnIgnore(errors);

  const hasErrors = errors.some((err) => err.type === "error");
  const hasWarnings = errors.some((err) => err.type === "warn");

  if (errors.length === 0) {
    await updateModel();
    return;
  }

  if (hasErrors) return;

  if (hasWarnings) {
    saveWithInvalidValidationConfirmationDialog.open();
    return;
  }
}

function close() {
  emits("close");
}

watch(baseCluster, handleBaseClusterChange);
watch(hierarchy, handleHierarchyChange);

onMounted(async () => {
  await fillForm();

  validate();
  watch(form.value, debouncedValidation);
});
</script>

<style scoped>
.row {
  @apply md:mb-6 md:grid md:grid-cols-2 md:gap-14;
}
.row-item {
  @apply mb-6 md:mb-0;
}
</style>
