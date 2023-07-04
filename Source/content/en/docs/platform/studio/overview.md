---
title: Overview
description: Overview of Aigonix Studio
keywords: Studio, PaaS, General
weight: 1
---

Aigonix Studio is the web-based interface for managing your [Applications]({{<ref application>}}) and [Microservices]({{<ref microservice>}}) in the Aigonix Platform. It is the main interface for interacting with the platform and is where you will spend most of your time when interacting with the platform.

In Studio you can create and manage Applications, [Environments]({{<ref environment>}} ), Microservices and other products and services.

## Getting started

To access Studio you need to be a customer of Aigonix. If you are not a customer, you can [contact us](https://aigonix.com/contact) to learn more and hopefully become one.

Once you have access to Studio, you can log in using your credentials at [dolittle.studio](https://dolittle.studio). You can now create your first Application and start deploying your Microservices into that application.

## Components

When you run your [Microservices]({{<ref microservice>}}) in the Aigonix Platform you will have access to a number of components that will help you manage your services.

You will define each [Application]({{<ref application>}}) with its [Environments]({{<ref environment>}}), and add Microservices to them. You define which Docker image to use for each Microservice, and whether or not you want to use the Dolittle Runtime. You can use a publicly available image, or store your container image in the provided [container-registry]({{<ref container_registry>}}).

If you use the Dolittle Runtime one will be made available to your [Head]({{<ref "microservice#head">}}) and through it you will have access to [Tenanted resources]({{<ref tenants>}}) like the [Event Store]({{<ref event_store>}}) and [Read Cache]({{<ref "resource_system#read_cache" >}}). If you do not use the [Dolittle Runtime](https://github.com/dolittle/runtime) the service will run the assigned Docker-image without permanent storage (stateless).

You can make your services available to the internet if you so wish. If you do not they will only be available within the platform.

```mermaid
flowchart TB
    subgraph Legend
        S[Docker Container]
        R>Dolittle Runtime]
        D[(Database)]
        F[\Studio function/]
    end
    subgraph Customer
        subgraph app1[Application with 3 Environments]
            subgraph app1dev[Development Environment]
                subgraph App1DevMS1[Microservice with Runtime]
                    App1DevMS1head[Head] --SDK--> App1DevMS1runtime>Runtime]

                    App1DevMS1runtime --uses--> App1DevMS1EventStore[(Event Store)]
                    App1DevMS1runtime --makes available--> App1DevMS1ReadCache[(Read Cache)]
                end
                subgraph App1DevMS2[Microservice]
                    App1DevMS2Head[Head]

                end
                App1DevMS1EventStore --in--> app1devDB[(Dev Database)]
                App1DevMS1ReadCache --in--> app1devDB
                Logs1dev[\Log viewer/] -.gathers logs.-> App1DevMS1head
                Logs1dev -.gathers logs.-> App1DevMS2Head
            end
            subgraph app1test[Test Environment]
                subgraph App1TestMS1[Microservice with Runtime]
                    App1TestMS1Head[Head] --uses--> App1TestMS1Runtime>Runtime]

                    App1TestMS1Runtime --uses--> App1TestMS1EventStore[(Event Store)]
                    App1TestMS1Runtime --makes available--> App1TestMS1ReadCache[(Read Cache)]
                end
                subgraph App1TestMS2[Microservice]
                    App1TestMS2Head[Head]
                end
                App1TestMS1EventStore --in--> app1testDB[(Test Database)]
                App1TestMS1ReadCache --in--> app1testDB

                Logs1test[\Log viewer/] -.gathers logs.-> App1TestMS1Head
                Logs1test -.gathers logs.-> App1TestMS2Head
            end
            subgraph app1prod[Production Environment]
                subgraph App1ProdMS1[Microservice with Runtime]
                    App1ProdMS1Head[Head] --uses-->  App1ProdMS1Runtime>Runtime]

                    App1ProdMS1Runtime --uses--> App1ProdMS1EventStore[(Event Store)]
                    App1ProdMS1Runtime --makes available--> App1ProdMS1ReadCache[(Read Cache)]
                end
                subgraph App1ProdMS2[Microservice]
                    App1ProdMS2Head[Head]
                end

                App1ProdMS1EventStore --in--> app1prodDB[(Prod Database)]
                App1ProdMS1ReadCache --in--> app1prodDB

                Logs1prod[\Log viewer/] -.gathers logs.-> App1ProdMS1Head
                Logs1prod[\Log viewer/]  -.gathers logs.-> App1ProdMS2Head
            end
            Docs1[\Documentation/]


            app1devDB -.regular backups.-> Backups1[\Backups/]
            app1testDB -.regular backups.-> Backups1
            app1prodDB -.regular backups.-> Backups1
        end
        subgraph app2[Application with 1 Environment]
            subgraph app2prod[Production Environment]
                subgraph App2ProdMS1[Microservice with Runtime]
                    App2ProdMS1Head[Head] --uses--> App2ProdMS1Runtime>Runtime]

                    App2ProdMS1Runtime --uses--> App2ProdMS1EventStore[(Event Store)]
                    App2ProdMS1Runtime --makes available--> App2ProdMS1ReadCache[(Read Cache)]
                end
                subgraph App2ProdMS2[Microservice]
                    App2ProdMS2Head[Head]
                end
                App2ProdMS1EventStore --in--> app2prodDB[(Prod Database)]
                App2ProdMS1ReadCache --in--> app2prodDB

                Logs2prod[\Log viewer/] -.gathers logs.-> App2ProdMS1Head
                Logs2prod -.gathers logs.-> App2ProdMS2Head
            end

            Docs2[\Documentation/]

            app2prodDB -.regular backups.-> Backups2[\Backups/]
        end
        ACR[\Container Registry/]
    end
```