import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "design-systems-raze",
  apiKey: import.meta.env.TRIGGER_API_KEY,
  apiUrl: import.meta.env.TRIGGER_API_URL,
});
