import type { IRadioButtonOption } from "@/common/components/editors/types";

export const attributeAccessWriteOptions: IRadioButtonOption[] = [
  { value: "false", label: "False" },
  { value: "true", label: "True" },
  { value: "optional", label: "Optional" },
];

export const attributeAccessReadPrivilegeOptions: IRadioButtonOption[] = [
  { value: "view", label: "View" },
  { value: "operate", label: "Operate" },
  { value: "manage", label: "Manage" },
  { value: "admin", label: "Admin" },
];

export const attributeAccessWritePrivilegeOptions: IRadioButtonOption[] = [
  { value: "operate", label: "Operate" },
  { value: "manage", label: "Manage" },
  { value: "admin", label: "Admin" },
];

export const attributeQualityPersistenceOptions: IRadioButtonOption[] = [
  { value: "volatile", label: "Volatile" },
  { value: "nonVolatile", label: "NonVolatile" },
  { value: "fixed", label: "Fixed" },
];

export const clusterAttributesSectionStartLevel = 3;
export const clusterAttributeStartLevel = 3;
export const clusterAttributeSectionStartLevel = 4;

export const deviceTypeAttributesSectionStartLevel = 5;
