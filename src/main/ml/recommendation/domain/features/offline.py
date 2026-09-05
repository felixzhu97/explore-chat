from typing import Dict, Tuple

from domain.etl.engagement_features import build_user_recent_engagement_features
from domain.features.registry import FeatureDefinition, registry


def register_offline_features() -> None:
    registry.register(
        FeatureDefinition(
            name="user_post_recent_engagement",
            entity="post",
            compute_offline=build_user_recent_engagement_features,
        )
    )


def build_all_offline_features() -> Dict[str, Dict[Tuple[str, str], Dict[str, float]]]:
    register_offline_features()
    features: Dict[str, Dict[Tuple[str, str], Dict[str, float]]] = {}
    for feat in registry.all():
        if feat.compute_offline is None:
            continue
        value = feat.compute_offline()
        features[feat.name] = value
    return features

