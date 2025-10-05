#!/usr/bin/env bash
set -e
# Build and run the BE/swp391 Maven module
cd BE/swp391
if [ -f "./mvnw" ]; then
  ./mvnw -DskipTests package
else
  mvn -DskipTests package
fi

JAR=target/swp391-0.0.1-SNAPSHOT.jar
if [ ! -f "$JAR" ]; then
  echo "Jar not found: $JAR"
  exit 1
fi

java -Dserver.port=${PORT:-8080} -jar "$JAR"
