<template>
  <span
    class="mr-3 inline-flex h-5 w-5 items-center rounded-md p-1 text-xs font-bold text-white"
    :class="colorClass"
  >
    <span
      :class="textColor"
      class="inline-flex items-center"
      style="font-size: 11px"
    >
      {{ text }}
    </span>
  </span>
</template>

<script lang="ts" setup>
import type { NameAbbreviationBadgeType } from "./types";

interface Props {
  type?: NameAbbreviationBadgeType;
}

const bgColors: { [key in NameAbbreviationBadgeType]: string } = {
  userGuide: "bg-orange-500",
  releaseNotes: "bg-yellow-500",
  cluster: "bg-cyan-600",
  deviceType: "bg-green-600",
  productPICS: "bg-blue-600",
};

const abbreviations: { [key in NameAbbreviationBadgeType]: string } = {
  userGuide: "Ug",
  releaseNotes: "Rn",
  cluster: "Cl",
  deviceType: "De",
  productPICS: "Pi",
};

const textColors: { [key in NameAbbreviationBadgeType]: string } = {
  userGuide: "text-black",
  releaseNotes: "text-black",
  cluster: "text-white",
  deviceType: "text-white",
  productPICS: "text-white",
};

const props = defineProps<Props>();

const colorClass = props.type ? bgColors[props.type] : "bg-gray-500";
const text = props.type ? abbreviations[props.type] : "";
const textColor = props.type ? textColors[props.type] : "text-white";
</script>
