package com.chat.status.infra;

import com.chat.status.domain.model.StatusView;
import com.chat.status.domain.repository.StatusViewRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataStatusViewRepository
    extends JpaRepository<StatusView, String>, StatusViewRepository {

  @Override
  Optional<StatusView> findByStatusIdAndViewerId(String statusId, String viewerId);

  @Override
  long countByStatusId(String statusId);
}
