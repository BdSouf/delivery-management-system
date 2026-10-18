FROM amazoncorretto:17
WORKDIR /app
COPY target/courier-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8093
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
