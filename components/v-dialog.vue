<template>
  <Dialog
    :visible="props.visible"
    :header="props.title"
    :maximizable="props.maximizable"
    :dismissable-mask="!!props.dismissableMask"
    modal
    :draggable="false"
    position="center"
    :breakpoints="props.breakpoints"
    :style="{ ...defaultStyles, ...props.style }"
    @update:visible="emits('close')"
  >
    <slot v-if="props.visible" />
    <template v-if="slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import { useSlots } from "vue";

interface IDialogProps {
  title: string;
  visible?: boolean;
  maximizable?: boolean;
  dismissableMask?: boolean;
  breakpoints?: { [key: string]: string };
  style?: any;
}

const defaultStyles = { minWidth: "25vw" };

const props = defineProps<IDialogProps>();
const emits = defineEmits(["close"]);
const slots = useSlots();
</script>
