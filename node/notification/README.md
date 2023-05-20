# Description

Notification service that sends download link or error message to user's email.

## Configuration

Create secret env variable for the service. This should be .yaml file

```
cd manifests

touch secret.yaml
```

Pass valid EmailJS variables:

```.yaml
apiVersion: v1
kind: Secret
metadata:
  name: notification-secret // should be the same as in deployment.yaml configMapRef field
stringData:
  EMAIL_SERVICE: service_xxxx
  EMAIL_TEMPLATE: template_xxxx // EmailJS template id
  EMAIL_KEY: public_key // public EmailJS key

type: Opaque
```

Once file is created you can apply files:

```
kubectl apply -f ./
```
