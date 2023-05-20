# Description

Auth service handles user creation, verification and sign in logic. Auth is JWT based, user data is stored in PostgreSQL along with tokens. This service requires PostreSQL installed. You can use docker image as well but make sure you provided necessary variables to connect to DB.

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
  name: auth-secret
stringData:
  DB_NAME: AuthService
  DB_PASSWORD: postgres
  DB_USERNAME: postgres
  JWT_ACCESS_SECRET: "your_secret_jwt_key"
  JWT_REFRESH_SECRET: "your_refresh_secret_jwt_key"
type: Opaque


```

If you need, you can change auth-configmap.yaml file as well.

```.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-configmap
data:
  DB_HOST: host.minikube.internal // your internal hostname
  DB_PORT: "5432"

```

Once files are created you can apply them:

```
kubectl apply -f ./
```
