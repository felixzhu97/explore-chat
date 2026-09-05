package com.chat.analytics.infra;

import com.chat.analytics.domain.model.AnalyticsEvent;
import com.chat.analytics.domain.repository.AnalyticsEventRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataAnalyticsEventRepository
    extends JpaRepository<AnalyticsEvent, String>, AnalyticsEventRepository {

  @Override
  default long countAll() {
    return count();
  }
}
