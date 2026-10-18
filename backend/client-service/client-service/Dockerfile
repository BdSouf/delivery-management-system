FROM amazoncorretto:17
WORKDIR /app
COPY target/client-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8092
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
