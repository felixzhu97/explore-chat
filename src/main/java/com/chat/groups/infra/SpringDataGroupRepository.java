package com.chat.groups.infra;

import com.chat.groups.domain.model.Group;
import com.chat.groups.domain.repository.GroupRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataGroupRepository extends JpaRepository<Group, String>, GroupRepository {

  @Override
  default List<Group> listAll() {
    return findAllByOrderByCreatedAtDesc();
  }

  List<Group> findAllByOrderByCreatedAtDesc();

  @Override
  default void delete(Group group) {
    deleteById(group.getId());
  }
}
