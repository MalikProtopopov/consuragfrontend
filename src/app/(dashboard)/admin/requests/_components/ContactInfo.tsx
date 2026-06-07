import { Phone, Mail, MessageCircle } from "lucide-react";
import type { PlanRequestDetail } from "@/shared/types/api";

export const ContactInfo = ({ request }: { request: PlanRequestDetail }) => {
  if (request.user?.email) {
    return (
      <div className="flex items-center gap-1.5">
        <Mail className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.user.email}</span>
      </div>
    );
  }
  if (request.contact_email) {
    return (
      <div className="flex items-center gap-1.5">
        <Mail className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.contact_email}</span>
      </div>
    );
  }
  if (request.contact_telegram) {
    return (
      <div className="flex items-center gap-1.5">
        <MessageCircle className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.contact_telegram}</span>
      </div>
    );
  }
  if (request.contact_phone) {
    return (
      <div className="flex items-center gap-1.5">
        <Phone className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.contact_phone}</span>
      </div>
    );
  }
  return <span className="text-text-muted text-sm">—</span>;
};
