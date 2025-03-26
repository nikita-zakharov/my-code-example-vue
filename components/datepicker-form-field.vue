<template>
  <div class="relative">
    <DatePicker
      v-model="model"
      :date-format="props.dateFormat"
      :min-date="props.min"
      :max-date="props.max"
      :disabled="props.disabled"
      :has-error="validation && validation.$error"
    />
    <small v-if="validation && validation.$errors.length > 0" class="p-error">
      {{ validation.$errors.map((error) => error.$message).join(", ") }}
    </small>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Validation } from "@vuelidate/core";
import DatePicker from "@/common/components/editors/v-datepicker.vue";
import type { CalendarValueType } from "@/common/components/form-fields/types";

interface IDateFormFieldProps {
  modelValue: CalendarValueType;
  validation?: Validation;

  label: string;
  className?: string;
  disabled?: boolean;
  dateFormat?: string;
  min?: Date;
  max?: Date;
}

const props = defineProps<IDateFormFieldProps>();

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>
