---
title: Apache Kafka notes
image: https://kafka.apache.org/22/images/kafka-apis.png
date: 2019-04-10
description:
   Some Apache Kafka & Confluent notes. 
quote: FromSources Blog 
hashtags: serverless, cold, start, lambda, aws
---

![An image](https://kafka.apache.org/22/images/kafka-apis.png)



# Publish/subscribe
Publish/subscribe messaging is a pattern that is characterized by the sender (publisher) of a piece of data (message) not specifically directing it to a receiver. Instead, the publisher classifies the message somehow, and that receiver (subscriber) subscribes to receive certain classes of messages. Pub/sub systems often have a broker, a central point where messages are published, to facilitate this.

# Apache Kafka
Apache Kafka is a publish/subscribe messaging system. It is often described as a “distributed commit log” or more recently as a “distributing streaming platform.” 
Data within Kafka is stored durably, in order, and can be read deterministically. In addition, the data can be distributed within the system to provide additional protections against failures, as well as significant opportunities for scaling performance.

Goals:
* Decouple producers and consumers by using a push-pull model
* Provide persistence for message data within the messaging system to allow multiple consumers
* Optimize for high throughput of messages
* Allow for horizontal scaling of the system to grow as the data streams grew. 

The unit of data within Kafka is called a **message** => array of bytes
 **KEY** (optional) => Message metadata => byte array

 **Batches**: Messages are written into Kafka in batches. Reduces overhead of individual roundtrips acroos the network, for each meessage. 
 Batches are typically compressed => more efficient data transfer. 

 ## Schemas 
 A consistent data format is important in Kafka, as it allows writing and reading messages
to be decoupled

By using well-defined schemas and storing them in a common repository, the messages in Kafka can be understood without coordination.

JSON / XML  => Lack features such as robust type handling and compability between schema versions.  
**Apache Avro**, serialization framework.
  * Compact serialization format, schemas that are separate from the message payloads
  * Do not rqueire code to be generated when they change
  * String data typing and schema evolution. 
  * Backward and forward compatibility. 

## Topics
Messages in Kafka are categorized into **topics**
Topics are additionally broken down into a
number of partitions
A topic typically has multiple partitions, there is
no guarantee of message time-ordering across the entire topic, just within a single partition.

**Partitions** are also the way that Kafka provides redundancy and scalability. Each partition can be hosted on a different server, which means that a
single topic can be scaled horizontally across multiple servers to provide performance
far beyond the ability of a single server.

## Producers and Consumers 
**Producers** create new messages (publishers/writers).
A message will be produced to a specific topic.
The producer does not care what partition a specific message is written to and will balance messages over all partitions of a topic evenly.
In some cases, the producer will direct messages to specific partitions. This is typically done using the message key and a partitioner that will generate a hash of the key and map it to a specific
partition. This assures that all messages produced with a given key will get written to
the same partition

**Consumers** read messages. (subscribers/readers). 
The consumer subscribes to one or more topics and
reads the messages in the order in which they were produced. The consumer keeps track of which messages it has already consumed by keeping track of the *offset* of messages. 

 **offset** => integer 

 * Each message in a given partition has a unique offset.

 **Consumer group** => consumers that work together to consume a topic.
 Each partition is only consumed by one member.
 The mapping of a consumer to a partition is often called **ownership of the partition** by the consumer.

 # Brokers and Clusters
 Broker => Kafka server. Operate as part of a *cluster*.

 Broker receives messages from producers => assigns offsets to them => commits the messages to storage on disk.

 Broker serve consumers => respond to fetch requests for partitions and responding with the messages.

 Controller => one broker will also function as the cluster *controller*
   Admin operaitons:
   * Assigning partitions to brokers 
   * Monitoring for broker failures

The *leader of the partition* => partition is owned by a single broker in the cluster. A partition may be assigned to multiple brokers, which will result in the partition being replicated. Another broker can take over leadership if there is a broker failure. However, all consumers and producers operating on that partition must connect to the leader. 

## Retention 
The durable storage of messages for some period of time. Kafka brokers are configured with a default retention setting for topics, either retaining messages for some period of time or until the topic reaches a certain size in bytes. Once these limits are reached, messages are expired and deleted so that the retention configuration is a minimum amount of data available at any time. 
Individual topics can also be configured with their own retention settings. Topics can also be configured as *log compacted* => Kafka will retain only the last message produced with a specific key. This can be useful for changelog-type data, where
only the last update is interesting.

## Multiple Clusters 

* Segregation of types of data
* Isolation for security requirements
* Multiple datacenters (disaster recovery)

The replication mechanisms within the Kafka lusters are designed only to work within a single cluster, not between multiple clusters.

**MirrorMaker** => Kafka consumer and producer, linked together with a
queue. Messages are consumed from one Kafka cluster and produced for another.


## Multiple Producers
## Multiple Consumers
## Disk-Based Retention
Consumers do not always need to work in real time. Durable retention
means that if a consumer falls behind, either due to slow processing or a burst in traffic, there is no danger of losing data.

## Scalable 
Start with a single broker => expand to a larger cluster.
Expansions can be performed while the cluster is online, with no impact.

**High Performance**
Apache Kafka carries messages between the various members of the infrastructure, providing a consistent interface for all clients

# Use Cases
* Activity tracking
* Messaging
* Metrics and logging
* Commit log
* Stream processing


