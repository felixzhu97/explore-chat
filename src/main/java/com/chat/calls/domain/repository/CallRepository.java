package com.chat.calls.domain.repository;

import com.chat.calls.domain.model.Call;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.calls.domain.model.Call} aggregates. */
public interface CallRepository {

  Call save(Call call);

  Optional<Call> findById(String id);

  List<Call> findByParticipant(String userId);
}
