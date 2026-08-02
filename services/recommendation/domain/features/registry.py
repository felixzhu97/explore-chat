from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Literal, Optional


EntityType = Literal["user", "post", "reel"]


@dataclass
class FeatureDefinition:
    name: str
    entity: EntityType
    compute_offline: Optional[Callable[..., Any]] = None
    compute_online: Optional[Callable[..., Any]] = None


class FeatureRegistry:
    def __init__(self) -> None:
        self._features: Dict[str, FeatureDefinition] = {}

    def register(self, feature: FeatureDefinition) -> None:
        self._features[feature.name] = feature

    def get(self, name: str) -> Optional[FeatureDefinition]:
        return self._features.get(name)

    def all(self) -> List[FeatureDefinition]:
        return list(self._features.values())


registry = FeatureRegistry()

