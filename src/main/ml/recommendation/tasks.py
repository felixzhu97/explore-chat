import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from celery_app import app


@app.task(bind=True)
def run_suggestions(self):
    from run_user_suggestions import main
    return main()


@app.task(bind=True)
def run_explore(self):
    from run_explore import main
    return main()
