---
title: Update configurations
description: How to update configuration files in the Dolittle Platform
weight: 10
---

## Prerequisites
Familiar with the following:
- Kubernetes
- yaml

## Recommendation
For users on Windows OS, we recommend that you use WSL/Ubuntu as your shell/terminal instead of CMD/Poweshell.

- [Install WSL on Windows 10](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

## Installation
Install the following software:

- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

## Configuration

After an environment has been provisioned for you in the Dolittle PaaS, you will receive a yaml file per environment. The files will be similar to this:

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: application-namespace
  name: app-dev-ms-env-variables
  labels:
    tenant: Customer
    application: App-Dev
    microservice: MS-A
data:
  OPENID_AUTHORITY: "yourapp.auth0.com"
  OPENID_CLIENT: "client-id"
  OPENID_CLIENTSECRET: "client-secret"

---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: application-namespace
  name: app-dev-ms-config-files
  labels:
    tenant: Customer
    application: App-Dev
    microservice: MS-A
data:
  myapp.json: |
    {
       "somekey": "somevalue"
    }
```

The files represent configmap resources in Kubernetes. We recommend that you store the files in a version control system(VCS) of your choice. 

## Purpose

Each yaml file consists of 2 configmaps per micro-service:

- `app-dev-ms-env-variables`: This configmap is for your environmental variables that will be passed on to the container at start up.
- `app-dev-ms-config-files`: This configmap is for add/override files. The default mount point is app/data


{{% alert title="Please do NOT edit/change the following:" color="warning" %}}

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: application-namespace
  name: app-dev-ms-env-variables
  labels:
    tenant: Customer
    application: App-Dev
    microservice: MS-A
data:
```
The above mentioned data is vital to the deployment and must not be altered in any way. Any changes here may result in forbidden response when the apply command is run.
{{% /alert %}}



You may alter the content under data:
```yaml
  OPENID_AUTHORITY: "yourapp.auth0.com"
  OPENID_CLIENT: "client-id"
  OPENID_CLIENTSECRET: "client-secret"
  connectionstring__myconnection: "strings"
```

Alter existing or add new key/value pairs.

```yaml
myapp.json: |
    {
       "somekey": "somevalue"
    }

customSetting.json: |
  {
    "settings": {
       "connection":"connectionstring"
     }
  }
```

Alter existing or add new JSON data that will be linked to a specific file that will be available at runtime under app/data/

## Setup

You need to setup your [AKS credentials]({{< ref "deploy_an_application#setup" >}}).

## Update configurations

To update the configurations:

```shell
kubectl apply -f <filename>
```

You must be in the directory of the yaml file before running the command.


To update/add a single key in the config:

```shell
kubectl patch -n <Application Namespace> configmap <Configmap Name>  -p '{"data":{"my-key":"value that i want"}}'
```

To remove a single key from the configuration:

```shell
kubectl patch -n <Application Namespace> configmap <Configmap Name>  -p '{"data":{"my-key":null}}'
```


## See configurations


JSON output

```shell
kubectl get -n <Application Namespace> configmap <Configmap Name> -o json
```

YAML output:

```shell
kubectl get -n <Application Namespace> configmap <Configmap Name> -o yaml
```




For an advanced print out, you need a tool called jq for parsing

kubectl get -n <Application Namespace> configmap <Configmap Name> -o json | jq -j '.data | to_entries | .[] | "\(.key): \(.value)\n"'
