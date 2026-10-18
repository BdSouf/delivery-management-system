# E3 sous-etape 3 — runtime image (JAR buildé en local avant)
# Build local:  .\mvnw.cmd -DskipTests package
# Image:        docker build -t delivery/discovery-server:pilot .
FROM amazoncorretto:17
WORKDIR /app
COPY target/discovery-server-1.0.0.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
