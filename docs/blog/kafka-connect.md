---
title: Kafka Connect
image: https://cdn-images-1.medium.com/max/1600/1*eC3fKob7FdMJqITZX5ZX6w.png
date: 2019-04-20
description:
   Some Apache Kafka Connect notes. 
quote: FromSources Blog 
hashtags: kafka, connect, confluent, apache, streaming
---

![An image](https://cdn-images-1.medium.com/max/1600/1*eC3fKob7FdMJqITZX5ZX6w.png)

# Data pipelines

* Kafka Connect has its own in-memory objects that include data types and schemas, it allows for pluggable converters to allow storing these records in any format.

* Kafka allows encrypting data on the wire, as it is piped from sources to Kafka and from Kafka to sinks. It also supports authentication (via SASL) and authorization.

* Kafka also provides an audit log to track access—unauthorized and authorized. With some extra coding, it is also possible to track where the events in each topic came from and who modified them, so you can provide the entire lineage for each record.

* Coupling
  * Ad-hoc pipelines
  * Loss of metadata
  * Extreme processing

* The more agile way is to preserve as much of the raw data as possible and allow downstream apps to make their own decisions regarding data processing and aggregation

# When to Use Kafka Connect Versus Producer / Consumer

* Use Kafka clients when you can modify the code of the application that you want to connect an application to and when you want to either push data into Kafka or pull data from Kafka.
* Use Connect to connect Kafka to datastores that you did not write and whose code you cannot or will not modify.

# Kafka Connect

* Kafka Connect is a part of Apache Kafka and provides a scalable and reliable way to move data between Kafka and other datastores. There is no need to install it separately.

* Provides APIs and a runtime to develop and run connector plugins
 
* Internal Topics:
  * **connect-configs** stores configurations 
  * **connect-status** helps to elect leaders for connect
  * **connect-offsets** store source offsets for source connectors

* Kafka Connect Sink is used to export data from Kafka to external databases.

* Kafka Connect Source is used to import from external databases into Kafka.

You cannot have more sink tasks (= consumers) than the number of partitions

* Kafka Connect runs as a **cluster of worker processes**

* Kafka Connect also has a standalone mode
  * all the connectors and tasks run on the one standalone worker.

* Look at the Connect worker log after deleting a connector, you should see all other connectors restarting their tasks. They are restarting in order to rebalance the remaining tasks between the workers and ensure equivalent workloads after a connector was removed.

## Configuration 

* **bootstrap.servers**: A list of Kafka brokers that Connect will work with

* **group.id**: All workers with the same group ID are part of the same Connect cluster

* **key.converter**: Set the converter for the key. Default is JSON format using the *JSONConverter*
  **key.converter.schema.enable=true/false** -- JSON messages can include a schema or be schema-less
  **key.converter.schema.registry.url** -- Avro

* **value.converter**: Set the converter for the value. Default is JSON format using the *JSONConverter*
  **value.converter.schema.enable=true/false** -- JSON messages can include a schema or be schema-less
  **value.converter.schema.registry.url** -- Avro

* **rest.host.name** and **rest.port** Connectors are typically configured and monitored through the REST API of Kafka Connect.
  * http://localhost:8083/
  * http://localhost:8083/connector-plugins - Get the Connector plugins 

## Install Connectors plugins 

* Take the jars connectors and copy them into Kafka Connect’s class path
* REST API to validate configuration for a connector
* While the connector is running, if you insert additional rows in the source table, you should immediately see them reflected in the target topic.

## Connectors and tasks
Connector plugins implement the connector API, which includes two parts:

 * **Connectors**:  
  * Determining how many tasks will run for the connector - choosing the lower of **max.tasks**
  * Deciding how to split the data-copying work between the tasks
  * Getting configurations for the tasks from the workers and passing it along

* **Tasks** 
  * Tasks are responsible for actually getting the data in and out of Kafka. 
  * All tasks are initialized by receiving a context from the worker.
  * Source context includes an object that allows the source task to store the offsets of source records.
  * Context for the sink connector includes methods that allow the connector to control the records it receives from Kafka

## Workers 

* Execute the connectors and tasks. 
* Handling the HTTP requests that define connectors and their configuration. 
* Storing the connector configuration 
* Starting the connectors and their tasks 
* Passing the appropriate configurations along.
* Automatically committing offsets for both source and sink connectors and for handling retries when tasks throw errors.
* If a worker process is stopped or crashes, other workers in a Connect cluster will recognize that (using the heartbeats in Kafka’s consumer protocol) and reassign the connectors and tasks that ran on that worker to the remaining workers
* If a new worker joins a Connect cluster, other workers will notice that and assign connectors or tasks to it to make sure load is balanced among all workers fairly.

## Converters and Connect’s data model

* Source connector: read an event from the source system and generate a pair of Schema and Value. 
* Sink connectors: get a Schema and Value pair and use the Schema to parse the values and insert them into the target system.
* When the connector returns a Data API record to the worker, the worker then uses the configured converter to convert the record to either an Avro object, JSON object, or a string, and the result is then stored into Kafka.
* When the Connect worker reads a record from Kafka, it uses the configured converter to convert the record from the format in Kafka (i.e., Avro, JSON, or string) to the Connect Data API record and then passes it to the sink connector, which inserts it into the destination system.

## Offset management

* When the source connector returns a list of records, which includes the source partition and offset for each record, the worker sends the records to Kafka brokers. If the brokers successfully acknowledge the records, the worker then stores the offsets of the records it sent to Kafka.

* Sink connectors have an opposite but similar workflow: they read Kafka records, which already have a topic, partition, and offset identifiers. Then they call the connector put() method that should store those records in the destination system. If the connector reports success, they commit the offsets they’ve given to the connector back to Kafka, using the usual consumer commit methods.
