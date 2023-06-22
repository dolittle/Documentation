---
title: Aigonix Studio
description: Overview of the Dolittle Studio
keywords: Studio, PaaS, General
weight: 60
type: "space"
---

Aigonix Studio is your management-tool to interact with services and products you run in the Dolittle Platform. It is a web-based application that is available at [dolittle.studio](https://dolittle.studio).

In Studio you can create and manage Applications, Environments, Microservices and other products and services.

## Getting started

To access Studio you need to be a customer of Aigonix. If you are not a customer, you can [contact us](https://dolittle.com/contact) to learn more and hopefully become one.

Once you have access to Studio, you can log in using your credentials at [dolittle.studio](https://dolittle.studio). You can now create your first Application and start deploying your Microservices into that application.

## Components

When you run your Microservices in the Aigonix platform we will set up Applications with Environments wherein Microservices run. You will define each Application with its Environments, and add Microservices to them. You define which Docker image to use for each Microservice, and whether or not you want to use the Dolittle Runtime. If you use the Runtime one will be available from your Head and through it you will have access to Tenanted resources like the Event Store and Read Cache.

```mermaid
flowchart TB
    subgraph Customer
        subgraph app1[Application with 3 Environments]
            subgraph app1dev[Development Environment]
                subgraph app1devms1[Microservice with Runtime]
                    app1devms1head[Head] --SDK--> app1devms1runtime[Runtime]

                    app1devms1runtime --uses--> app1devms1eventstore[(Event Store)]
                    app1devms1runtime --makes available--> app1devms1readmodel[(Read Cache)]
                end
                subgraph app1devms2[Microservice]
                    app1devms2head[Head]

                end
                app1devms1eventstore --in--> app1devDB[(Dev Database)]
                app1devms1readmodel --in--> app1devDB
            end
            subgraph app1test[Test Environment]
                subgraph app1testms1[Microservice with Runtime]
                    app1testms1head[Head] --uses--> app1testms1runtime[Runtime]

                    app1testms1runtime --uses--> app1testms1eventstore[(Event Store)]
                    app1testms1runtime --makes available--> app1testms1readmodel[(Read Cache)]
                end
                subgraph app1testms2[Microservice]
                    app1testms2head[Head]
                end
                app1testms1eventstore --in--> app1testDB[(Test Database)]
                app1testms1readmodel --in--> app1testDB
            end
            subgraph app1prod[Production Environment]
                subgraph app1prodms1[Microservice with Runtime]
                    app1prodms1head[Head] --uses-->  app1prodms1runtime[Runtime]

                    app1prodms1runtime --uses--> app1prodms1eventstore[(Event Store)]
                    app1prodms1runtime --makes available--> app1prodms1readmodel[(Read Cache)]
                end
                subgraph app1prodms2[Microservice]
                    app1prodms2head[Head]
                end

                app1prodms1eventstore --in--> app1prodDB[(Prod Database)]
                app1prodms1readmodel --in--> app1prodDB
            end
            ACR1[Container Registry]
            Docs1[Documentation]

            Logs1[Log viewer] -.gathers logs.-> app1devms1head
            Logs1 -.gathers logs.-> app1devms2head
            Logs1 -.gathers logs.-> app1testms1head
            Logs1 -.gathers logs.-> app1testms2head
            Logs1 -.gathers logs.-> app1prodms1head
            Logs1 -.gathers logs.-> app1prodms2head

            app1devDB -.regular backups.-> Backups1[Backups]
            app1testDB -.regular backups.-> Backups1
            app1prodDB -.regular backups.-> Backups1
        end
        subgraph app2[Application with 1 Environment]
            subgraph app2prod[Production Environment]
                subgraph app2prodms1[Microservice with Runtime]
                    app2prodms1head[Head] --uses--> app2prodms1runtime[Runtime]

                    app2prodms1runtime --uses--> app2prodms1eventstore[(Event Store)]
                    app2prodms1runtime --makes available--> app2prodms1readmodel[(Read Cache)]
                end
                subgraph app2prodms2[Microservice]
                    app2prodms2head[Head]
                end
                app2prodms1eventstore --in--> app2prodDB[(prod Database)]
                app2prodms1readmodel --in--> app2prodDB
            end

            ACR2[Container Registry]
            Docs2[Documentation]
            Logs2[Log viewer] -.gathers logs.-> app2prodms1head
            Logs2 -.gathers logs.-> app2prodms2head

            app2prodDB -.regular backups.-> Backups2[Backups]
        end
    end
```