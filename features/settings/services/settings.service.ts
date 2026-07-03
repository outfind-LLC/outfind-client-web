import { api } from "@/lib/api/client";
import type {
  UpdateUserSettingsPayload,
  UserSettings,
} from "@/interfaces/user-settings.interface";

/** App preferences — persisted server-side on `/me/settings` (never localStorage). */
export const settingsService = {
  async getMySettings(): Promise<UserSettings> {
    return api.get<UserSettings>("/me/settings");
  },

  async updateMySettings(
    patch: UpdateUserSettingsPayload,
  ): Promise<UserSettings> {
    return api.patch<UserSettings>("/me/settings", patch);
  },
};
