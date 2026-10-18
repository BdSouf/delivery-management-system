FROM amazoncorretto:17
WORKDIR /app
COPY target/package-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8094
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
