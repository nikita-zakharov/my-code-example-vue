<template>
  <label for="input" class="relative block h-64 overflow-hidden rounded">
    <input
      id="input"
      type="file"
      class="overlayed block"
      :multiple="props.multiple"
      :accept="acceptFormats.join(',')"
      @change="handleUpload"
    />
    <span
      class="overlayed pointer-events-none flex items-center justify-center border-2 border-gray-200 bg-white text-gray-800"
    >
      <div class="flex flex-col gap-4 text-center">
        <slot>
          <i class="pi pi-cloud-upload text-8xl" style="color: #a5a9ad" />
        </slot>
        <slot>
          <div class="flex flex-col text-center">
            <span class="input-text">Drag & drop</span>
            <span class="input-text">
              or
              <a class="underline">Browse</a>
              files
            </span>
          </div>
        </slot>
        <slot>
          <span class="formats-text">
            Supported formats: {{ supportedFormatsText }}
          </span>
        </slot>
        <small
          v-if="!!props.files.length"
          class="flex items-center justify-center"
          :title="props.files.map(({ name }) => name).join(', ')"
        >
          <slot name="file" :files="props.files" :upload-info="uploadInfo">
            {{ uploadInfo }}
          </slot>
        </small>
      </div>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import "primeicons/primeicons.css";

interface IFileInputProps {
  multiple: boolean;
  onFileUpload: (files: File[]) => void;
  files: File[];
}

const supportedFormats = ["xml", "zip"];
const acceptFormats = [".xml", "application/zip"];
const supportedFormatsText = supportedFormats
  .map((format) => format.toUpperCase())
  .join(", ");

const props = defineProps<IFileInputProps>();

const uploadInfo = computed(() => {
  return props.files.length === 1
    ? props.files[0].name
    : `${props.files.length} files selected`;
});

const handleUpload = (e: Event) => {
  const fileList = (e.target as HTMLInputElement).files;
  if (!fileList) {
    return;
  }

  const convertedFileList = Array.from(fileList);
  props.onFileUpload(convertedFileList);
};
</script>

<style scoped>
.overlayed {
  @apply absolute top-0 left-0 right-0 bottom-0 block flex w-full cursor-pointer;
}

.input-text {
  @apply text-sm font-normal leading-5;
}

.formats-text {
  @apply text-sm font-normal leading-5;

  color: #576574;
}
</style>
