---
title: Environment
description: An environment within an Applicaiton in the Aigonix Platform
keywords: Environment, PaaS, General, Application, Platform, Studio
weight: 20
---

An environment is a grouping of [Microservices]({{<ref microservice>}}) within an [Application]({{<ref application>}}). Environments are commonly used to separate instances of your Microservices into different stages of your development process.

When you create an Application you define which environment(s) you want in that Application. The available
options are Development, Test and Production. You can choose to have all three, or just one or two of them.

## Microservices

Each environment acts as a separate area wherein your microservices run. When you navigate to an Application in Studio it will list the Microservices running in the current environment. The current Environment is displayed and can be changed in a drop-down box on the top right corner of the page.

## Databases

Each environment has its own database. The database is used by the Microservices in that environment to store their data. The database is a MongoDB database and is managed by the Aigonix Platform. You can access the database backups through the Studio interface. If necessary you can also access the database through port-forwarding to the Kubernetes cluster. You will need to contact Aigonix Support to get the elevated permissions needed to access the database directly.