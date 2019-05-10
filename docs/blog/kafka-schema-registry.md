---
title: Kafka Schema Registry
image: https://2.bp.blogspot.com/-jL5Th4PnNQE/Wq6n45Br3PI/AAAAAAABOnE/aACQB9pthd0d09p3brNWN8mYxDtY9FJigCLcBGAs/s1600/Avro-Kafka.png
date: 2019-04-23
description:
   Some Apache Kafka Schema Registry notes. 
quote: FromSources Blog 
hashtags: kafka, schemas, registry, avro, confluent, apache, streaming
---

![An image](https://2.bp.blogspot.com/-jL5Th4PnNQE/Wq6n45Br3PI/AAAAAAABOnE/aACQB9pthd0d09p3brNWN8mYxDtY9FJigCLcBGAs/s1600/Avro-Kafka.png)

# Schemas 
 A consistent data format is important in Kafka, as it allows writing and reading messages to be decoupled

By using well-defined schemas and storing them in a common repository, the messages in Kafka can be understood without coordination.

JSON / XML  => Lack features such as robust type handling and compability between schema versions.  

**Apache Avro**, serialization framework.

  * Compact serialization format, schemas that are separate from the message payloads
  * Do not rqueire code to be generated when they change
  * String data typing and schema evolution. 
  * Backward and forward compatibility. 

# Confluent Schema Registry

Schema Registry is a distributed storage layer for Avro Schemas which uses Kafka as its underlying storage mechanism. Data is stored on brokers.

The Confluent Schema Registry is your safeguard against incompatible schema changes and will be the component that ensures no breaking schema evolution will be possible. Kafka Brokers do not look at your payload and your payload schema, and therefore will not reject data.

It provides a RESTful interface for storing and retrieving Avro schemas. Clients can interact with the schema registry using the HTTP or HTTPS interface.

* Assigns globally unique ID to each registered schema. Allocated IDs are guaranteed to be monotonically increasing but not necessarily consecutive.
* Kafka provides the durable backend, and functions as a write-ahead changelog for the state of Schema Registry and the schemas it contains.
* Schema Registry is designed to be distributed, with single-master architecture, and ZooKeeper/Kafka coordinates master election (based on the configuration).

* The Schema Registry stores all the schemas in the **_schemas** Kafka topic

First local cache is checked for the message schema. In case of cache miss, schema is pulled from the schema registry. An exception will be thrown in the Schema Registry does not have the schema (which should never happen if you set it up properly)

Schema Registry reports a variety of metrics through JMX. It can also be configured to report stats using additional pluggable stats reporters using the metrics.reporters configuration option. The easiest way to view the available metrics is to use jconsole to browse JMX MBeans.

[Metrics](https://docs.confluent.io/current/schema-registry/monitoring.html)

# Schema compatibility

Schema compatibility checking is implemented in Schema Registry by versioning every single schema
The compatibility type determines how Schema Registry compares the new schema with previous versions of a schema, for a given subject.

[Compatibility Types](https://docs.confluent.io/current/schema-registry/avro.html#summary)

* **BACKWARD** - consumers using the NEW schema can read data produced with the last schema. -- DEFAULT -- 
* **BACKWARD_TRANSITIVE**: consumer using schema X can process data produced with schema X, X-1, or X-2

*There is no assurance that consumers using older schemas can read data produced using the new schema. Therefore, upgrade all consumers before you start producing new events.*

* **FORWARD** compatibility means that data produced with a new schema can be read by consumers using the last schema, even though they may not be able to use the full capabilities of the new schema
* **FORWARD_TRANSITIVE**: data produced using schema X can be ready by consumers with schema X, X-1, or X

*There is no assurance that consumers using the new schema can read data produced using older schemas. Therefore, first upgrade all producers to using the new schema and make sure the data already produced using the older schemas are not available to consumers, then upgrade the consumers.*

* **FULL**: backward and forward compatibile between schemas X and X-1
* **FULL_TRANSITIVE**: backward and forward compatibile between schemas X, X-1, and X-2

*There are assurances that consumers using older schemas can read data produced using the new schema and that consumers using the new schema can read data produced using older schemas. Therefore, you can upgrade the producers and consumers independently.*

* **NONE** compatibility type means schema compatibility checks are disabled.

*Compatibility checks are disabled. Therefore, you need to be cautious about when to upgrade clients.*

## Schema ID allocation

Schema ID allocation always happen in the master node and they ensure that the Schema IDs are monotonically increasing.

## API

```
 curl -X GET http://localhost:8081/config
 {"compatibility":"BACKWARD"}
```

# AVRO

An Avro schema defines the data structure in a JSON format.

One of the interesting things about Avro is that it not only requires a schema during data serialization, but also during data deserialization.

optional field in an Avro record => **doc**

## Subject Name Strategy

Avro serializer registers a schema in Schema Registry under a subject name, which essentially defines a namespace in the registry:

* Compatibility checks are per subject
* Versions are tied to subjects
* When schemas evolve, they are still associated to the same subject but get a new schema id and version
 
The subject name depends on the subject name strategy, which you can set to one of the following three values:

**TopicNameStrategy** (io.confluent.kafka.serializers.subject.TopicNameStrategy) – this is the default
**RecordNameStrategy** (io.confluent.kafka.serializers.subject.RecordNameStrategy)
**TopicRecordNameStrategy** (io.confluent.kafka.serializers.subject.TopicRecordNameStrategy)

Clients can set the subject name strategy for either the key or value, using the following configuration parameters:

* **key.subject.name.strategy**
* **value.subject.name.strategy**



