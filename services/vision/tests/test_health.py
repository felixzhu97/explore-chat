from main import app


def test_health_route_registered():
    paths = {getattr(r, "path", None) for r in app.routes}
    assert "/health" in paths
    assert "/api/v1/images:predict" in paths
    assert "/api/v1/images:moderate" in paths
    assert "/api/v1/videos:moderate" in paths
    assert "/predict" not in paths
