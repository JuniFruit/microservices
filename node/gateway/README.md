# Description

Gateway service of the application. Here we accept and uploading video files, handling downloading of mp3 files and deleting users' Mongodb buckets on error.

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
