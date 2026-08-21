/* global HTMLMetaElement, HTMLLinkElement */
import { useEffect } from 'react';
import { LandingMetadata } from '../types/landing';
import { env } from '@/config/env';

export function useLandingMetadata(metadata: LandingMetadata): void {
  useEffect(() => {
    const canonicalUrl = new URL(metadata.path, `${env.publicSiteUrl}/`).toString();
    const imageUrl = new URL(metadata.imagePath ?? '/og/vum-crm-landing.svg', `${env.publicSiteUrl}/`).toString();

    document.title = metadata.title;

    const setMetaTag = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrValue] = selector.replace('meta[', '').replace(']', '').split('=');
        element.setAttribute(attrName, attrValue.replace(/"/g, ''));
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    setMetaTag('meta[name="description"]', 'content', metadata.description);
    setMetaTag('meta[property="og:title"]', 'content', metadata.title);
    setMetaTag('meta[property="og:description"]', 'content', metadata.description);
    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    setMetaTag('meta[property="og:image"]', 'content', imageUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [metadata.title, metadata.description, metadata.path, metadata.imagePath]);
}
