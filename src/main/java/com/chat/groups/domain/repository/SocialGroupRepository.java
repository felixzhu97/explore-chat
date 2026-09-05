package com.chat.groups.domain.repository;

import com.chat.groups.domain.model.SocialGroup;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.groups.domain.model.SocialGroup} aggregates. */
public interface SocialGroupRepository {

  SocialGroup save(SocialGroup group);

  Optional<SocialGroup> findById(String id);

  List<SocialGroup> listAll();

  void delete(SocialGroup group);
}
