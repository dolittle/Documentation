---
title: Deploy an application
description: How to deploy an application in the Aigonix Platform
weight: 5
---
{{% pageinfo color="info" %}}
This guide is for the users of our [Platform]({{< ref "platform" >}}). If you aren't already a user, please [contact us](https://www.dolittle.com/contact) to host your microservices!
{{% /pageinfo %}}

## Prerequisites

Familiar with the following:
- Docker containers
- Kubernetes
- Microsoft Azure

## Recommendation
For users on Windows OS, we recommend that you use WSL/Ubuntu as your shell/terminal instead of CMD/Powershell.

- [Install WSL on Windows 10](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

## Installation
Install the following software:

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Configuration
After an environment has been provisioned for you in the Dolittle PaaS, you will receive these details to use with the deployment commands in the following sections:

```
Subscription ID
Resource Group
Cluster Name
Application Namespace
ACR Registry
Image Repository
Deployment Name
Application URL
```

## Setup
All commands are meant to be run in a terminal (Shell)

### AZURE
Login to Azure:

```shell
az login
```

### AKS - Azure Container Service

Get credentials from Dolittle's AKS cluster

```shell
az aks get-credentials -g <Resource Group> -n <Cluster Name> --subscription <Subscription ID>
```


### ACR - Azure Container Registry

Get credentials to Azure Container Registry
```
az acr login -n <ACR Registry> --subscription <Subscription ID>
```

## Deployment

To deploy a new version of your application, follow these steps. For <Tag> use semantic versioning, e.g. "1.0.0".


### Docker

Build your image

```shell
docker build -t <Image Repository>:<Tag> .
```

Push the image to ACR

```shell
docker push <Image Repository>:<Tag>
```


### Kubernetes

Patch the Kubernetes deployment to run your new version

```shell
kubectl patch --namespace <Application Namespace> deployment <Deployment Name> -p '{"spec": { "template": { "spec": { "containers": [{ "name":"head", "image": "<Image Repository>:<Tag>"}] }}}}'
```

## Debugging

### kubectl commands:

Show the status of your application pods

```shell
kubectl -n <Application Namespace> get pods
```

Show deployed version of your application

```shell
kubectl -n <Application Namespace> get deployment -o wide
```

Show the logs of the last deployed version of the application

```shell
kubectl -n <Application Namespace> logs deployments/<Deployment Name>
```

Logs for the application, last 100 lines

```shell
kubectl -n <Application Namespace> logs deployments/<Deployment Name> --tail=100
```
