#!/bin/bash
# Demo user is seeded by Spring DemoDataLoader on boot (cristiano@whatschat.com / 123456).
set -euo pipefail
echo "Java API seeds the demo user on startup when chat.demo-seed=true (default)."
echo "Start the API with: ./gradlew bootRun"
echo "Login: cristiano@whatschat.com / 123456"
