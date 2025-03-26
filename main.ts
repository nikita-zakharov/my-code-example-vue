import { createApp } from "vue";
import router from "@/router";

import "@/assets/styles/global.scss";

import App from "./app.vue";

import initModules from "./modules";
import initPlugins from "./plugins";

const app = createApp(App);
initPlugins(app);
initModules({ app, router });

app.use(router).mount("#app");

function showAppVersion() {
  const version = import.meta.env.PACKAGE_VERSION;
  console.log(`Version: ${version}`);
}

showAppVersion();
