#!/bin/bash
# Demo users are seeded by Spring DemoDataLoader on boot (alice@example.com / 123456).
set -euo pipefail
echo "Java API seeds demo users on startup when chat.demo-seed=true (default)."
echo "Start the API with: ./gradlew bootRun"
echo "Login: alice@example.com / 123456"
