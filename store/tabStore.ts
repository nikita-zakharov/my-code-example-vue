import { defineStore } from "pinia";
import { nanoid } from "nanoid";
import type { Model } from "@/common/types/types";
import type { TabComponentName } from "@/modules/home/components/types";

export type Tab = {
  id: string;
  name: string;
  componentName: TabComponentName;
  componentProps: any;
  modelId?: string;
};

const storeName = "tab";

interface State {
  openedTabs: Tab[];
  focusedTabId: string | null;
}

export const useTabStore = defineStore(storeName, {
  state: () =>
    <State>{
      openedTabs: [],
      focusedTabId: null,
    },
  getters: {
    getById(state) {
      return (id: string) => {
        return state.openedTabs.find((tab) => tab.id === id);
      };
    },
    focusedTab(state): Tab | undefined {
      return state.openedTabs.find((tab) => tab.id === state.focusedTabId);
    },
    focusedModelId(): string | undefined {
      return this.focusedTab?.modelId;
    },
    getTabByModelId(state) {
      return (modelId: string) => {
        return state.openedTabs.find((tab) => tab.modelId === modelId);
      };
    },
    getTabByComponentName(state) {
      return (componentName: string) => {
        return state.openedTabs.find(
          (tab) => tab.componentName === componentName
        );
      };
    },
  },
  actions: {
    focusTabById(id: string) {
      this.focusedTabId = id;
    },
    open(data: {
      name: string;
      modelId?: string;
      componentName: TabComponentName;
      componentProps?: any;
    }) {
      const id = nanoid();
      this.openedTabs.push({
        id,
        name: data.name,
        modelId: data.modelId,
        componentName: data.componentName,
        componentProps: data.componentProps,
      });
      this.focusTabById(id);
    },
    close(id: string) {
      this.openedTabs = this.openedTabs.filter((tab) => tab.id !== id);
      this.focusedTabId = this.openedTabs[0]?.id || null;
    },
    clearRemovedModelsTabs(models: Model[]) {
      const modelIds = models.map(({ id }) => id);
      this.openedTabs = this.openedTabs.filter((tab) => {
        if (!tab.modelId) return true;
        return modelIds.includes(tab.modelId);
      });
    },
    updateTabNamesFromModels(models: Model[]) {
      this.openedTabs.forEach((tab) => {
        if (!tab.modelId) return;
        const model = models.find((m) => m.id === tab.modelId);
        if (!model) return;
        if (tab.name !== model.name) {
          tab.name = model.name;
        }
      });
    },
    synchronizeModels(models: Model[]) {
      this.clearRemovedModelsTabs(models);
      this.updateTabNamesFromModels(models);

      if (!this.focusedTabId) return;
      if (!this.openedTabs.some((tab) => tab.id === this.focusedTabId)) {
        this.focusedTabId = this.openedTabs[0]?.id || null;
      }
    },
  },
  persist: true,
});
