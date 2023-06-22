---
title: Application
description: What is an Application in the Aigonix Platform
keywords: Application, PaaS, General, Platform, Studio
weight: 10
---

An Application is a logical grouping of Microservices. It is the top-level container for your Microservices and is used to group them together. An Application can have multiple Environments, which are used to separate your Microservices into different stages of your development process.

When you create a new application you will define a name for it and which environments the application
should have.

## Microservices

Each application acts as a separate area wherein your microservices run. When you navigate in an application in Studio you will see the services that are deployed in that application.

Each microservice will be listed with their name, container-image, which version of the Dolittle Runtime (if any) they are set up with, their publich URL (if any) and their status. If your application has multiple environments you can switch between them using the dropdown in the top right corner.

You can navigate into each Microservice to see more details about it, such as the logs for the service, the configuration for the service and metrics like the CPU and Memory consumption of the service. You can change the configuration of the service and restart it from this view.

## Functions

There are several functions available in an Application -view. You can create new Microservices, and you can access the backups of the databases that are used by the services in that application.

Each application has its own docker-image container registry, which you can access from the application view.

There is a log-viewer, which consolidates logs from all the services in the application into one view. Here you can filter the logs by service, time and search for specific text. You can also have a live-view of the logs, which will update the view as new logs are generated.

There is a documentation-view in the application that contains sections on how to access the container-registry, how to access the underlying Kubernetes cluster if needed and how to setup Azure Pipelines to deploy your containers directly to the application.


