# Description

Simple converter app to explore microservices architecture.

Unfortunately, app is not published to any resource, however server is configured to work within local minikube cluster. To test the app you will have to install local DBs on your machine or using Docker and pass required env values to each service configuration files. You can check details inside each service folder.

After installing kubectl and minikube make sure to map host to mp3conveter.com inside etc/hosts file

```
# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
127.0.0.1 mp3converter.com
127.0.0.1 rabbitmq-manager.com
```

# Technologies

- Node
- Express
- Kubernetes
- Minikube
- Docker
- Typescript
- RabbitMQ
- JWT
- Axios
- PostgreSQL
- MongoDB/GridFS
- EmailJS
