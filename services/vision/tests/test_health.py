from main import app


def test_health_route_registered():
    paths = {getattr(r, "path", None) for r in app.routes}
    assert "/health" in paths
