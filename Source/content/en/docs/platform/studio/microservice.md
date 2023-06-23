---
title: Microservice
description: What is a Microservice in the Aigonix Platform
keywords: Microservice, PaaS, General, Platform, Studio
weight: 30
---

A Microservice is a single unit of deployment in the Aigonix Platform. It is a containerized application that runs in a Kubernetes cluster. Each Microservice is deployed as a separate container in the cluster.

A Microservice lives inside an [Application]({{<ref application>}}) and can be deployed to multiple [Environments]({{<ref environment>}}) in that application.

A Microservice in the Aigonix Platform is a Head and optionally a Runtime and data-storage. If you use the Dolittle Runtime you will have access to the [Event Store]({{<ref event_store>}}) and [Read Cache]({{<ref "resource_system#read_cache">}}) for that Microservice.

If you do not use the Dolittle Runtime the Microservice will be stateless and will not have access to any storage. Any state you need to store will have to be stored in an external service. You will have access to the local file-system, but that is not persisted between Microservice restarts, and we do not recommend relying upon it.

## Docker image

Each Microservice is deployed using a Docker image. You can use a publicly available image, or you can use a Docker image that you have built yourself and stored in the [container-registry]({{< ref container_registry>}}) that is available for each application.

## Head

Head is the name of the pod where your Microservice Docker image is deployed. It is the entry-point for your Microservice and is the only part of your Microservice that may be exposed to the internet. A Microservice must have a Head and can have a Runtime.

## Dolittle Runtime

Each Microservice can be deployed with the [Dolittle Runtime](https://github.com/dolittle/runtime). The Dolittle Runtime is available as a docker image, and will be deployed alongside your Head. Your code communicates with the Runtime through the [Dolittle SDK](https://github.com/dolittle/dotnet.sdk). The Runtime is used to connect to the [Event Store]({{<ref event_store>}}) and will make the resource-system available to you, where you can get the Tenanted [Read Cache]({{<ref "resource_system#read_cache">}}) and to publish events to the [Event Horizon]({{<ref event_horizon>}}).

## Configuration

Each Microservice can be configured with a set of environment variables and configuration-files. These variables are available to your code and can be used to configure your Microservice. The Aigonix Studio gives you an interface to manage these variables and files.

Your code can read the environment variables and configuration-files. The files will be available under the `/app/data` -folder in your container. The Aigonix Platform will make sure that the files are available in the container when it is deployed. **Therefore any files your image contains in `/app/data` will *not* be available when running in the Aigonix Platform.**

You can upload files through Aigonix Studio, and you can also download the files and environment variables from Studio.

### Secrets

You can also use the environment variables to store secrets, like connection strings and API-keys. Mark these environment-variables as *secret* to ensure that they be stored encrypted in the platform. You may want to look into a proper [secret-management system](https://en.wikipedia.org/wiki/Key_management), like [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault/) or [Amazon Key Management System](https://aws.amazon.com/kms/) if you have a lot of secrets, and just store the access-keys in the environment variables.