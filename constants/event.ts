import type { IRadioButtonOption } from "@/common/components/editors/types";

export const eventAccessReadPrivilegeOptions: IRadioButtonOption[] = [
  { value: "view", label: "View" },
  { value: "operate", label: "Operate" },
  { value: "manage", label: "Manage" },
  { value: "admin", label: "Admin" },
];

export const clusterEventsSectionStartLevel = 3;
export const clusterEventSectionStartLevel = 4;
export const clusterEventFieldStartLevel = 4;
export const clusterEventFieldSectionStartLevel = 5;

export const deviceTypeEventsSectionStartLevel = 5;
