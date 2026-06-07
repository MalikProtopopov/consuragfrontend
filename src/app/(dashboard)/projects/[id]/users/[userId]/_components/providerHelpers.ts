import { Send, Globe, MessageCircle, Mail, User, type LucideIcon } from "lucide-react";
import type { IdentityProvider } from "@/shared/types/api";

export function getProviderIcon(provider: IdentityProvider): LucideIcon {
  switch (provider) {
    case "telegram":
      return Send;
    case "web":
      return Globe;
    case "whatsapp":
      return MessageCircle;
    case "email":
      return Mail;
    default:
      return User;
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
