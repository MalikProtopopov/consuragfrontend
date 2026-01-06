// API
export { platformConfigApi } from "./api/platformConfigApi";

// Hooks
export {
  platformConfigKeys,
  usePlatformConfigs,
  usePlatformConfig,
  useCreatePlatformConfig,
  useUpdatePlatformConfig,
  useDeletePlatformConfig,
  useValidatePlatformKey,
} from "./model/usePlatformConfig";

// Categories and helpers
export {
  PLATFORM_CONFIG_CATEGORIES,
  PLATFORM_KEY_LABELS,
  PLATFORM_KEY_DESCRIPTIONS,
  PLATFORM_KEY_PLACEHOLDERS,
  getCategoryByKeyType,
  getAllPlatformKeyTypes,
} from "./lib/categories";

