import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function GoogleTagManager() {
  const location = useLocation();

  useEffect(() => {
    // Load GTM script
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    
    // Push page view event
    window.dataLayer?.push({
      event: 'page_view',
      page_path: location.pathname,
      page_title: document.title,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  // GTM tracking utilities
  window.trackEvent = (eventName, eventData = {}) => {
    window.dataLayer?.push({
      event: eventName,
      ...eventData,
      timestamp: new Date().toISOString()
    });
  };

  return null;
}

// Event tracking functions
export const trackConversion = (serviceId, providerId, amount) => {
  window.dataLayer?.push({
    event: 'service_hired',
    service_id: serviceId,
    provider_id: providerId,
    value: amount,
    currency: 'BRL'
  });
};

export const trackProfileView = (profileType, profileId) => {
  window.dataLayer?.push({
    event: 'profile_viewed',
    profile_type: profileType, // 'provider' or 'client'
    profile_id: profileId
  });
};

export const trackSubscription = (planName, amount) => {
  window.dataLayer?.push({
    event: 'subscription_started',
    plan_name: planName,
    value: amount,
    currency: 'BRL'
  });
};

export const trackSearch = (query, category, resultsCount) => {
  window.dataLayer?.push({
    event: 'search',
    search_term: query,
    search_category: category,
    results_count: resultsCount
  });
};