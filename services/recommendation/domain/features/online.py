from typing import Dict, Tuple

from domain.etl.engagement_features import build_user_recent_engagement_features
from domain.features.registry import FeatureDefinition, registry


def register_online_features() -> None:
  registry.register(
    FeatureDefinition(
      name="user_post_recent_engagement",
      entity="post",
      compute_online=build_user_recent_engagement_features,
    )
  )


def get_online_features() -> Dict[str, Dict[Tuple[str, str], Dict[str, float]]]:
  register_online_features()
  features: Dict[str, Dict[Tuple[str, str], Dict[str, float]]] = {}
  for feat in registry.all():
    if feat.compute_online is None:
      continue
    value = feat.compute_online()
    features[feat.name] = value
  return features

