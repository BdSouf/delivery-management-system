# E3 sous-etape 4 — runtime image (JAR buildé en local avant)
# Build local:  .\mvnw.cmd -DskipTests package
# Image:        docker build -t delivery/auth-service:pilot .
FROM amazoncorretto:17
WORKDIR /app
COPY target/auth-service-1.0.0.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
