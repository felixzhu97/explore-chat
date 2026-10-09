package com.chat.groups.domain.repository;

import com.chat.groups.domain.model.Group;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.groups.domain.model.Group} aggregates. */
public interface GroupRepository {

  Group save(Group group);

  Optional<Group> findById(String id);

  List<Group> listAll();

  void delete(Group group);
}
