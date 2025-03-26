import { defineStore } from "pinia";
import type { Model } from "@/common/types/types";
import { ModelType } from "@/common/types/enums";

const storeName = "model";

interface State {
  models: Model[];
}

export const useModelStore = defineStore(storeName, {
  state: () =>
    <State>{
      models: [],
    },
  getters: {
    getById(state) {
      return (id: string): Model | undefined =>
        state.models.find((model) => model.id === id);
    },
    clusters(state) {
      return state.models.filter((m) => m.type === ModelType.Cluster);
    },
    productsPICS(state) {
      return state.models.filter((m) => m.type === ModelType.ProductPICS);
    },
  },
  actions: {
    update(id: string, data: Model) {
      const modelIndex = this.models.findIndex((model) => model.id === id);
      this.models[modelIndex] = data;
    },
    remove(id: string) {
      this.models = this.models.filter((model) => model.id !== id);
    },
    add(model: Model) {
      this.models.push(model);
    },
    setModels(models: Model[]) {
      this.models = models;
    },
    clear() {
      this.models = [];
    },
  },
});
