package com.chat.status.domain.repository;

import com.chat.status.domain.model.StatusView;
import java.util.Optional;

/** Persistence port for {@link com.chat.status.domain.model.StatusView} records. */
public interface StatusViewRepository {

  StatusView save(StatusView view);

  Optional<StatusView> findByStatusIdAndViewerId(String statusId, String viewerId);

  long countByStatusId(String statusId);
}
