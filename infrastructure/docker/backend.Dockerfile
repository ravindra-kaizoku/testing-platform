# --- Stage 1: Build Stage ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Production JRE Runtime ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Set non-root execution permissions and create writable storage directory
RUN addgroup -S spring && adduser -S spring -G spring && \
    mkdir -p /app/local-storage && \
    chown -R spring:spring /app

USER spring:spring

# Copy built JAR from Build Stage
COPY --chown=spring:spring --from=build /app/target/*.jar app.jar

# Expose HTTP API Port
EXPOSE 8080

# Environment variables profiles configuration (dev uses embedded H2; override with prod if PostgreSQL is provided)
ENV SPRING_PROFILES_ACTIVE=dev

ENTRYPOINT ["java", "-jar", "app.jar"]
