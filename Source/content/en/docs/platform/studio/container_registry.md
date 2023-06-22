---
title: Container Registry
description: Your docker image container registry
keywords: Platform, PaaS, Container Registry, Docker
weight: 60
---

All [Microservices]({{<ref microservice>}}) running in the Aigonix Platform are running in [Docker](https://www.docker.com/) containers. You can run public images, or you can run your own images. If you do not wish to publish the images of your Microservices to publicly available registries you can use one Aigonix provides for you.

This container registry is available at a unique host for your customer account. You can find the host in the documentation for your [Application]({{<ref application>}}) in Studio. It will look like `{your-random-id}.azurecr.io`.

To list what images are available in the registry you can navigate to the container-registry in Aigonix Studio, or you use the `az` command-line tool. You will need to log in to the Azure CLI and then you can run

```bash
az acr repository list --name {your-random-id} -o table
```

from your command-line. This will list all the images available in the registry.

To push a new image to the registry you tag the image with the registry host and then push it to the registry. You can do this with the `docker` command-line tool. Let us say you have an image called `my-image` that you want to push to the registry. You would then run

```bash
docker tag my-image {your-random-id}.azurecr.io/my-image:latest
docker push {your-random-id}.azurecr.io/my-image:latest
```

from your command-line. This will push the image to the registry and make it available for you to use in your [Microservices]({{<ref microservice>}}). This image will not be available on public registries, it will only be available to you.
