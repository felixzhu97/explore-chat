from main import app


def test_image_route_registered():
    paths = {getattr(r, "path", None) for r in app.routes}
    assert "/image/generate" in paths
