package com.chat.groups.infra;

import com.chat.groups.domain.model.SocialGroup;
import com.chat.groups.domain.repository.SocialGroupRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataSocialGroupRepository
    extends JpaRepository<SocialGroup, String>, SocialGroupRepository {

  @Override
  default List<SocialGroup> listAll() {
    return findAllByOrderByCreatedAtDesc();
  }

  List<SocialGroup> findAllByOrderByCreatedAtDesc();

  @Override
  default void delete(SocialGroup group) {
    deleteById(group.getId());
  }
}
