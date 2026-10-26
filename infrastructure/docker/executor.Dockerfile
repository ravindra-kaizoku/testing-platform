FROM maven:3.9.6-eclipse-temurin-21-alpine

# Install AWS CLI, bash, curl, and jq for worker script operations
RUN apk add --no-cache aws-cli bash curl jq

WORKDIR /executor

# Copy the execution agent script
COPY infrastructure/aws/executor-entrypoint.sh /executor/run.sh
RUN chmod +x /executor/run.sh

ENTRYPOINT ["/executor/run.sh"]
