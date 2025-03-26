<template>
  <div class="grow">
    <Splitter
      ref="splitterRef"
      class="h-screen overflow-hidden"
      :state-key="splitterStorageKey"
      :state-storage="splitterStorageState"
      @resizeend="onSplitterResize"
      @resizestart="onSplitterResizeStart"
    >
      <SplitterPanel
        class="sidebar-panel h-screen overflow-y-auto bg-neutral-200"
        :size="sidebarSplitterCurrentSize"
        :min-size="sidebarSplitterMinSize"
      >
        <VSidebar
          v-memo="[contentSplitterInitialSize, sidebarSplitterCurrentSize]"
        />
      </SplitterPanel>
      <SplitterPanel
        :size="contentSplitterCurrentSize"
        :min-size="contentSplitterMinSize"
        class="overflow-hidden"
      >
        <div class="h-screen bg-gray-100">
          <TabContainer
            v-memo="[sidebarSplitterInitialSize, contentSplitterCurrentSize]"
          />
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import VSidebar from "../components/v-sidebar.vue";
import type { SplitterResizeEndEvent } from "primevue/splitter";
import TabContainer from "@/modules/home/components/tab-container.vue";

const splitterStorageKey = "main-layout-splitter";
const splitterStorageState: "local" | "session" = "local";

const sidebarSplitterInitialSize = 20;
const contentSplitterInitialSize = 80;
const sidebarSplitterMinSize = 7;
const contentSplitterMinSize = 75;

const sidebarSplitterCurrentSize = ref(sidebarSplitterInitialSize);
const contentSplitterCurrentSize = ref(contentSplitterInitialSize);

const splitterRef = ref();

function init() {
  setCurrentSplitterSizes();
}

function onSplitterResizeStart(e: SplitterResizeEndEvent) {
  setCurrentSplitterSizes();
  if (e.originalEvent.stopPropagation) e.originalEvent.stopPropagation();
  if (e.originalEvent.preventDefault) e.originalEvent.preventDefault();
  e.originalEvent.cancelBubble = true;
  e.originalEvent.returnValue = false;
  return false;
}
function onSplitterResize(e: SplitterResizeEndEvent) {
  const [sidebarSize, contentSize] = e.sizes;
  sidebarSplitterCurrentSize.value = sidebarSize;
  contentSplitterCurrentSize.value = contentSize;
}

function setCurrentSplitterSizes() {
  if (!splitterRef.value) return;
  const [sidebarSize, contentSize] = splitterRef.value.panelSizes;
  sidebarSplitterCurrentSize.value = sidebarSize;
  contentSplitterCurrentSize.value = contentSize;
}
</script>

<style lang="scss">
.p-tabview .p-tabview-panels {
  padding: 0;
  overflow: auto;
}

.sidebar-panel {
  min-width: 150px;
}
</style>
