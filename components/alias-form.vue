<template>
  <div>
    <EditorFormHeader
      :model="model"
      editable-model-part="Cluster ID"
      @cancel="close"
      @save="onSave"
    />
    <div class="model-form-container">
      <div class="model-form-box">
        <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <StringFormField
            v-model="form.id"
            :validation="v$.id"
            :label="AliasLabel.Id"
            @blur="onIdInputBlur"
          />
          <StringFormField
            v-model="form.name"
            class="md:col-start-2 md:col-end-2 lg:col-start-2 lg:col-end-5"
            :validation="v$.name"
            :label="AliasLabel.Name"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EditorFormHeader from "@/common/components/editor-form-header/editor-form-header.vue";
import StringFormField from "@/common/components/form-fields/string-form-field.vue";
import { nextTick, onMounted, ref, toRaw, toRefs, watch } from "vue";
import type { Alias, Cluster } from "@/common/types/types";
import useVuelidate from "@vuelidate/core";
import { useModelStore } from "@/store";
import { useModelListService } from "@/common/composition/use-model-list-service";
import { useToastService } from "@/common/composition/use-toast-service";
import { AliasField } from "@/modules/editor/cluster/classification/alias-form/alias-form.types";
import type { AliasValidationState } from "@/modules/editor/cluster/classification/alias-validation/alias-validation.types";
import type { ValidationError } from "@/common/types/types";
import { getAliasValidationState } from "@/modules/editor/cluster/classification/alias-validation/alias-validation.utils";
import { clusterService } from "@/common/composition/container";
import { helpers } from "@vuelidate/validators";
import { useConfirmationDialog } from "@/common/composition/use-confirmation-dialog";
import { debounce } from "lodash";
import { validationDebounceDelayMS } from "@/common/constants/validation";
import { transformIdToHex } from "@/modules/editor/cluster/utils/transform-id-to-hex";
import { getClusterIdHex } from "@/common/helpers/helpers";

interface Props {
  modelId: string;
  aliasId?: string;
}

interface Emits {
  (name: "close"): void;
}

interface FormState {
  [AliasField.Id]: string;
  [AliasField.Name]: string;
}

enum AliasLabel {
  Id = "ID",
  Name = "Name",
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
  onAccept: saveAlias,
});

const model = toRaw(modelStore.getById(modelId.value));
const modelData = model && (model.data as Cluster);

const identification = modelData?.identification;
const aliases = modelData?.aliases || [];

const currentAlias = aliases?.find((a) => a.id === props.aliasId);

const validationState = ref<AliasValidationState>({ name: null, id: null });

const form = ref<FormState>({
  id: "",
  name: "",
});

const rules = {
  [AliasField.Id]: {
    modelValidation: helpers.withMessage(
      () => validationState.value.id?.error || "",
      () => !validationState.value.id?.error
    ),
  },
  [AliasField.Name]: {
    modelValidation: helpers.withMessage(
      () => validationState.value.name?.error || "",
      () => !validationState.value.name?.error
    ),
  },
};

const v$ = useVuelidate<FormState>(rules, form, {
  $lazy: true,
  $autoDirty: true,
});

const debouncedValidation = debounce(validate, validationDebounceDelayMS);

function setValidationState(errors: ValidationError[]) {
  const state = getAliasValidationState(errors);
  validationState.value = { ...state };
}

function close() {
  emits("close");
}

function prepareAlias(): Alias {
  return {
    id: form.value.id,
    name: form.value.name?.trim(),
  };
}

function validate() {
  const preparedAlias = prepareAlias();
  let uniqueAliases = [...aliases, preparedAlias];
  if (props.aliasId) {
    uniqueAliases = aliases.filter((a) => a.id !== props.aliasId);
    uniqueAliases.push(preparedAlias);
  }
  const result = clusterService.validateAlias(
    identification,
    preparedAlias,
    uniqueAliases
  );
  const errors = result.error || [];
  setValidationState(errors);
  nextTick(() => v$.value.$touch());
  return errors;
}

async function createAlias() {
  if (!model || !modelData) return;

  const alias = prepareAlias();

  if (aliases.length === 0) {
    modelData.aliases = [alias];
  } else {
    aliases.push(alias);
  }

  await modelListService.update(props.modelId, model);
}

async function updateAlias() {
  if (!model || !aliases) return;
  const currentAliasIndex = aliases?.findIndex(
    (alias) => alias.id === props.aliasId
  );

  if (currentAliasIndex === -1) return;
  aliases[currentAliasIndex] = prepareAlias();

  await modelListService.update(props.modelId, model);
}

function onIdInputBlur() {
  const hex = transformIdToHex(form.value.id, getClusterIdHex);
  if (!hex) return;

  form.value.id = hex;
}

async function saveAlias() {
  if (!props.aliasId) {
    await createAlias();
    close();
    return;
  }
  await updateAlias();
  close();
}

async function onSave() {
  const errors = validate();

  const hasErrors = errors.some((err) => err.type === "error");
  const hasWarnings = errors.some((err) => err.type === "warn");
  if (errors.length === 0) {
    await saveAlias();
  }

  if (hasErrors) return;

  if (hasWarnings) {
    saveWithInvalidValidationConfirmationDialog.open();
    return;
  }
  close();
}

function fillForm() {
  if (!currentAlias) return;

  form.value.id = currentAlias.id;
  form.value.name = currentAlias.name;
}

function init() {
  fillForm();

  if (currentAlias) validate();
  watch(form.value, debouncedValidation);
}

onMounted(() => {
  init();
});
</script>
