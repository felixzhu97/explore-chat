import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main() -> int:
    parser = argparse.ArgumentParser(description="Run recommendation jobs")
    parser.add_argument(
        "--job",
        choices=["suggestions", "feed_rank", "explore"],
        default="suggestions",
    )
    args = parser.parse_args()
    if args.job == "suggestions":
        from run_user_suggestions import main as run_suggestions
        return run_suggestions()
    if args.job == "feed_rank":
        from domain.models.pytorch_feed_ranker import main as run_feed_rank
        return run_feed_rank()
    if args.job == "explore":
        from run_explore import main as run_explore
        return run_explore()
    return 1


if __name__ == "__main__":
    sys.exit(main())
