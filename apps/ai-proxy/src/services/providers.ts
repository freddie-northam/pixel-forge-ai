import { DEFAULT_PROVIDER_NAME } from "@pixelforge/shared";

export interface ProviderInfo {
  id: string;
  mode: "mock" | "live";
  supportsStructuredJson: boolean;
  childSafeProfile: boolean;
}

const providers: ProviderInfo[] = [
  {
    id: DEFAULT_PROVIDER_NAME,
    mode: "mock",
    supportsStructuredJson: true,
    childSafeProfile: true
  }
];

export function listProviders(): ProviderInfo[] {
  return providers;
}
