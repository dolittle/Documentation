---
title: Update secrets
description: How to update secrets in the Aigonix Platform
weight: 15
---

{{% pageinfo color="info" %}}
This guide is for the users of our [Platform]({{< ref "platform" >}}). If you aren't already a user, please [contact us](https://www.dolittle.com/contact) to host your microservices!
{{% /pageinfo %}}

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

## Secrets

After an environment has been provisioned for you in the Dolittle PaaS, you will receive a yaml file per environment. The files will be similar to this:
```yaml
---
apiVersion: v1
kind: Secret
metadata:
  namespace: application-namespace
  name: apps-dev-ms-secret-env-variables
  labels:
    tenant: Customer
    application: App-Dev
    microservice: MS-A
type: Opaque
data:
   OPENID_SECRET: b3BlbiBpZCBzZWNyZXQ=
```


The files represent the [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) -resource in Kubernetes. We recommend that you store the files in a version control system(VCS) of your choice.

## Purpose

Each yaml file consists of a secret per micro-service:

- `app-dev-ms-secret-env-variables`: This secret is for your environmental variables that will be passed on to the container at start up. One important thing to remember is that the values have to be encoded using base64.




{{% alert title="Please do NOT edit/change the following:" color="warning" %}}

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  namespace: application-namespace
  name: apps-dev-ms-secret-env-variables
  labels:
    tenant: Customer
    application: App-Dev
    microservice: MS-A
type: Opaque
data:
```
The above mentioned data is vital to the deployment and must not be altered in any way. Any changes here may result in forbidden response when the apply command is run.
{{% /alert %}}


You may alter existing or add new key/value pairs.
```yaml
  OPENID_SECRET: b3BlbiBpZCBzZWNyZXQ=
  DB_PASSWORD: c29tZSBwYXNzd29yZA==
```

## Setup

You need to setup your [AKS credentials]({{< ref "deploy_an_application#setup" >}}).

## Encode secrets

To encode values:

```shell
echo -n "my super secret pwd" | base64 -w0
```

The above command will give you:

```shell
bXkgc3VwZXIgc2VjcmV0IHB3ZA==
```

The value can then be added to the secrets:

```yaml
MY_SECRET: bXkgc3VwZXIgc2VjcmV0IHB3ZA==
```

## Update secrets

To update the secrets:

```shell
kubectl apply -f <filename>
```

You must be in the directory of the yaml file before running the command.


To update/add a single key in the secrets:

```shell
kubectl patch -n <Application Namespace> secret <Secrets Name>  -p '{"data":{"my-key":"value that i want encoded using base64"}}'
```


To remove a single key from the configuration:

```shell
kubectl patch -n <Application Namespace> secret <Secrets Name>  -p '{"data":{"my-key":null}}'
```

## See secrets

JSON output:

```shell
kubectl get -n <Application Namespace> secret <Secrets Name> -o json
```

YAML output:

```shell
kubectl get -n <Application Namespace> secret <Secrets Name> -o yaml
```

For an advanced print out, you need a tool called [`jq`](https://stedolan.github.io/jq/) for parsing the JSON in you shell:

```shell
kubectl get -n <Application Namespace> secret <Secrets Name> -o json | jq -j '.data | to_entries | .[] | "\(.key): \(.value)\n"'
```
