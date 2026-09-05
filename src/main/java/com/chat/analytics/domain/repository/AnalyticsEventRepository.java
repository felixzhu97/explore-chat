package com.chat.analytics.domain.repository;

import com.chat.analytics.domain.model.AnalyticsEvent;

/** Persistence port for {@link com.chat.analytics.domain.model.AnalyticsEvent} records. */
public interface AnalyticsEventRepository {

  AnalyticsEvent save(AnalyticsEvent event);

  long countAll();
}
