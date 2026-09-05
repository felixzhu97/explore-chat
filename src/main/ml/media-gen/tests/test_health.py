from main import app


def test_aip_media_routes_registered():
    paths = {getattr(r, "path", None) for r in app.routes}
    assert "/api/v1/images:generate" in paths
    assert "/api/v1/imageJobs/{image_job}" in paths
    assert "/api/v1/videos:generate" in paths
    assert "/api/v1/videoJobs/{video_job}" in paths
    assert "/api/v1/voices:synthesize" in paths
    assert "/image/generate" not in paths
