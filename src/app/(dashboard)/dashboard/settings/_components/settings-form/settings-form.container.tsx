"use client";

import { useSettingsForm } from "./settings-form.hook";
import { SettingsFormView } from "./settings-form.view";

export function SettingsForm() {
  const props = useSettingsForm();
  return <SettingsFormView {...props} />;
}
