FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/resumemaster-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]