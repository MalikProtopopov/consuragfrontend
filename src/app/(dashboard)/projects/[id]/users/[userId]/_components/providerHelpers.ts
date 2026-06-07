import type { IdentityProvider } from "@/shared/types/api";

export function getProviderIcon(provider: IdentityProvider): string {
  switch (provider) {
    case "telegram":
      return "📱";
    case "web":
      return "🌐";
    case "whatsapp":
      return "💬";
    case "email":
      return "📧";
    default:
      return "👤";
  }
}

export function getProviderLabel(provider: IdentityProvider): string {
  switch (provider) {
    case "telegram":
      return "Telegram";
    case "web":
      return "Web";
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "Email";
    case "api":
      return "API";
    default:
      return provider;
  }
}
