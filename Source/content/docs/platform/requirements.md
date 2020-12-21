---
title: Requirements
description: Requirements for running microservices in the Dolittle platform
keywords: Platform, PaaS, Requirements
weight: 1
---

To be compatible with the environment of the Dolittle platform, there are certain requirements we impose on your microservices.
If they are not met, your application might behave unexpectedly - or in the worst case - not work at all.
The following list of requirements is subject to change, but we will always notify you when you have an application running in our platform before making any changes.

### 1. Your application must use the resource system
To ensure data privacy, security and proper segregation of your tenant's data, our platform has a resource management system.
This system controls access and connection settings for resources on a per request basis and will provide your microservice with the necessary information for accessing these resources programmatically.
The connection information will not be the same as when developing locally, so you must not embed connection settings in your code.

This requirement applies to read and write data to databases or files, or while making API-calls to services, both to internal resources provided by the Dolittle platform and external 3rd party services.

### 2. All your applications external endpoints must be configured and exposed through the platform
For the resource management system to work, and to protect your application and users from data leakage, we encrypt and authenticate all interactions with your application through the platform.
This means that your microservices will be completely isolated by default, and all endpoints that should be accessible outside our platform needs to be exposed explicitly and configured with appropriate encryption and authentication schemes.

To enable same-origin authentication flows and adhere to internet best practices, the platform will take control of a set of URIs for the hostnames you have allocated to your application. The following paths and any sub-path of these (in any form of capitalisation) are reserved for the platform:

- /.well-known
- /robots.txt
- /sitemap
- /api/Dolittle
- /Dolittle

### 3. Your microservices must be stateless, scalable and probeable
To allow for efficient hosting of your application, we have to able to upgrade, re-start, move and scale your microservices to handle the load and perform necessary security upgrades.
This means that you must not rely on any in-memory state for anything apart from the per-transaction state, and you must not rely on there being a single instance of your microservices at any point in time.

To ensure that your microservices are healthy and ready to perform work, your microservices must expose both liveness and readiness probes.
The microservice should respond to the liveness probe whenever it has successfully started and is in a functional state, and should respond to the readiness probe whenever it is free to handle incoming requests from users.

{{% notice tip %}}
For best practices regarding modern web-based applications, have a look at [the twelve-factor app](https://12factor.net).
{{% /notice %}}

### 4. Your application must adhere to semantic versioning of your microservices
We rely on [semantic versioning](https://semver.org) to properly track changes of your microservices (from an operational aspect) and to decide on the correct course of action when new versions of your microservices are built.
Minor or patch increments will result in automatic upgrades of your running microservices without any human interaction, while major increments require manual approval and potential updates of configuration or data structures.
This means that you must increment the major number when making changes to your microservices that require changes in the platform for your application to work properly.

### 5. Your frontend must be a static single-page application
To ensure that any user-facing frontend is served quickly and with minimal data-usage, we serve your frontend using separate servers with appropriate caching, compression and CDN strategies.
This means that your frontend must be built as a single-page application to static HTML, CSS and js files.
These files must be built and versioned alongside your backend microservices to ensure that the frontend and backend versions are aligned and function properly.
