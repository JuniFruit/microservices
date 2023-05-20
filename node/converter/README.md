# Description

Converter service where the main converation logic is stored. App is listening to a RabbitMQ queue to consume and process messages. Converter needs mongodb url to download user's video and convert it, then it uploads result back to mongo

## Configuration

Create secret env variable for the service. This should be .yaml file.

```
cd manifests

touch secret.yaml
```

Add this to the secret.yaml file:

```.yaml
apiVersion: v1
kind: Secret
metadata:
  name: gateway-secret
stringData:
  MONGO_URL: http://mongo_url.com // valid MongoDB url to connect to db

type: Opaque

```

Once file is created you can apply files:

```
kubectl apply -f ./
```
