FROM amazoncorretto:17
WORKDIR /app
COPY target/user-service-1.0.0.jar app.jar
EXPOSE 8091
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
