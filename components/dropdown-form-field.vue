<template>
  <div class="relative">
    <DropDown
      v-model="model"
      :options="props.options"
      :label="props.label"
      :disabled="props.disabled"
      :has-error="errorsText.length > 0"
      :editable="props.editable"
      :clearable="clearable"
    />
    <small v-if="errorsText.length > 0" class="p-error">
      {{ errorsText }}
    </small>
  </div>
</template>

<script lang="ts" setup>
import type { Validation } from "@vuelidate/core";
import type { IDropDownOption } from "@/common/components/form-fields/types";
import DropDown from "@/common/components/editors/v-dropdown.vue";
import { computed } from "vue";

interface IDropdownFormFieldProps {
  modelValue: any;
  validation?: Validation;
  options: IDropDownOption[];
  label?: string;
  disabled?: boolean;
  editable?: boolean;
  clearable?: boolean;
}

const props = withDefaults(defineProps<IDropdownFormFieldProps>(), {
  label: "",
  clearable: true,
});

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const errorsText = computed(
  () =>
    props.validation?.$errors.map((error) => error.$message).join(", ") || ""
);
</script>
