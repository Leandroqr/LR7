"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { getWhatsAppUrl } from "@/lib/site";
import { trackWhatsAppClick, type WhatsAppEventName } from "@/lib/whatsapp";

type WhatsAppLinkProps = Readonly<{
  message: string;
  eventName?: WhatsAppEventName;
  eventData?: Record<string, string | number>;
  children: ReactNode;
}> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;

export function WhatsAppLink({
  message,
  eventName = "whatsapp_click",
  eventData,
  children,
  onClick,
  ...anchorProps
}: WhatsAppLinkProps) {
  const whatsappUrl = getWhatsAppUrl(message);
  if (!whatsappUrl) return null;

  const trackClick: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"] = (event) => {
    trackWhatsAppClick(eventName, eventData);
    onClick?.(event);
  };

  return (
    <a
      {...anchorProps}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
    >
      {children}
    </a>
  );
}