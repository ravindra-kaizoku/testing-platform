#!/bin/bash
set -e

# Decoupled AWS Test Execution Agent Script
echo "[SYSTEM INFO] Launching cloud sandbox execution worker..."
echo "Project ID: ${PROJECT_ID}"
echo "Run ID:     ${RUN_ID}"
echo "S3 Bucket:  ${S3_BUCKET}"
echo "S3 Key:     ${WORKSPACE_KEY}"

# 1. Download workspace ZIP from S3
echo "[SYSTEM INFO] Fetching project source zip from S3 bucket..."
aws s3 cp "s3://${S3_BUCKET}/${WORKSPACE_KEY}" /executor/workspace.zip

# 2. Extract ZIP safely
echo "[SYSTEM INFO] Extracting workspace ZIP archive..."
mkdir -p /executor/workspace
unzip -q /executor/workspace.zip -d /executor/workspace
cd /executor/workspace

# 3. Trigger Maven test suite
echo "[SYSTEM INFO] Initiating Maven build compilation and surefire test suites..."
set +e # Don't exit immediately on test failures, we want to capture reports
mvn clean test &> /executor/execution.log
EXIT_CODE=$?
set -e

echo "[SYSTEM INFO] Maven test run finalized with exit code: ${EXIT_CODE}"

# 4. Upload raw console log outputs back to Amazon S3
echo "[SYSTEM INFO] Archiving terminal stdout logs to S3..."
aws s3 cp /executor/execution.log "s3://${S3_BUCKET}/logs/${RUN_ID}.log"

# 5. Format JSON payload for backend callback endpoint
echo "[SYSTEM INFO] Generating execution metrics report..."
LOGS_CONTENT=$(cat /executor/execution.log)

# Extract basic Surefire summary lines
SUMMARY_LINE=$(grep -a "Tests run:" /executor/execution.log | tail -n 1)
TESTS_RUN=0
FAILURES=0
ERRORS=0
SKIPPED=0

if [[ $SUMMARY_LINE =~ Tests\ run:\ ([0-9]+),\ Failures:\ ([0-9]+),\ Errors:\ ([0-9]+),\ Skipped:\ ([0-9]+) ]]; then
    TESTS_RUN="${BASH_REMATCH[1]}"
    FAILURES="${BASH_REMATCH[2]}"
    ERRORS="${BASH_REMATCH[3]}"
    SKIPPED="${BASH_REMATCH[4]}"
fi

# Determine final status
STATUS="COMPLETED"
if [ $EXIT_CODE -ne 0 ]; then
    STATUS="FAILED"
fi

# 6. HTTP POST Callback to notify backend API of execution results
echo "[SYSTEM INFO] Transmitting metrics callback to API gateway: ${BACKEND_API_URL}"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"${STATUS}\",
    \"testsRun\": ${TESTS_RUN},
    \"failures\": ${FAILURES},
    \"errors\": ${ERRORS},
    \"skipped\": ${SKIPPED},
    \"logs\": $(jq -Rs . /executor/execution.log)
  }" \
  "${BACKEND_API_URL}/api/projects/${PROJECT_ID}/runs/${RUN_ID}/callback"

echo "[SYSTEM INFO] Decoupled execution agent task finished successfully."
