#!/usr/bin/env bash
set -euo pipefail

echo "[start.sh] Original PWD: $(pwd)"

# Determine script directory (works even if called via relative path)
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# If repository layout is repo/BE/swp391, we expect this script to live in repo/BE/
# We want to run Maven inside swp391 module regardless of current working directory.
if [ -d "${SCRIPT_DIR}/swp391" ]; then
  MODULE_DIR="${SCRIPT_DIR}/swp391"
elif [ -d "${SCRIPT_DIR}/BE/swp391" ]; then
  # Edge case: script somehow placed higher; handle defensively.
  MODULE_DIR="${SCRIPT_DIR}/BE/swp391"
else
  echo "[start.sh] Could not locate swp391 module relative to ${SCRIPT_DIR}" >&2
  ls -al "${SCRIPT_DIR}" || true
  exit 1
fi

echo "[start.sh] Using module directory: ${MODULE_DIR}"
cd "${MODULE_DIR}"

# Prefer included Maven wrapper
if [ -x "./mvnw" ]; then
  MVN="./mvnw"
else
  MVN="mvn"
fi

echo "[start.sh] Building application (skip tests)..."
${MVN} -DskipTests package

JAR="target/swp391-0.0.1-SNAPSHOT.jar"
if [ ! -f "$JAR" ]; then
  echo "[start.sh] Jar not found: $JAR" >&2
  echo "Contents of target/:" >&2
  ls -al target || true
  exit 1
fi

PORT_ENV=${PORT:-8080}
echo "[start.sh] Launching jar on port ${PORT_ENV}"
exec java -Dserver.port=${PORT_ENV} -jar "$JAR"
