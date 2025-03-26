<template>
  <div class="relative">
    <CheckBox
      v-model="model"
      :label="props.label"
      :disabled="props.disabled"
      :has-error="validationErrors.length > 0"
    />
    <small v-for="error in validationErrors" :key="error.$uid" class="p-error">
      {{ error.$message }}
    </small>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Validation } from "@vuelidate/core";
import CheckBox from "@/common/components/editors/v-checkbox.vue";

interface ICheckboxFormFieldProps {
  modelValue: boolean;
  validation?: Validation;
  label?: string;
  disabled?: boolean;
}

const props = defineProps<ICheckboxFormFieldProps>();
const emit = defineEmits(["update:modelValue"]);

const validationErrors = computed(
  () => (props.validation && props.validation.$errors) || []
);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>
