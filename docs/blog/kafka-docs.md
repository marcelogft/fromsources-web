---
title: Apache Kafka notes
image: https://kafka.apache.org/22/images/kafka-apis.png
date: 2019-04-10
description:
   Some Apache Kafka & Confluent notes. 
quote: FromSources Blog 
hashtags: kafka, apache, confluent, broker
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
 **Value** => Message => byte array

 **Batches**: Messages are written into Kafka in batches. Reduces overhead of individual roundtrips acroos the network, for each meessage. 
 Batches are typically compressed => more efficient data transfer.  

# Brokers and Clusters
 * Broker => Kafka server. Operate as part of a *cluster*.

 * Broker receives messages from producers => assigns offsets to them => commits the messages to storage on disk.

 * Broker serve consumers => respond to fetch requests for partitions and responding with the messages.

## Configuration 

* **broker.id** - Every Kafka broker must have an integer identifier - unique within a single Kafka cluster

* **port** - a listener on TCP - DEFAULT port 9092 

* **zookeeper.connect** - The location of the Zookeeper used for storing the broker metadata - a semicolon-separated list of **hostname:port/path** strings:
  * *hostname*, the hostname or IP address of the Zookeeper server.
  * *port*, the client port number for the server.
  * */path*, an optional Zookeeper path to use as a chroot environment for the Kafka cluster. If it is omitted, the root path is used.

* **log.dirs** log segments are stored in the directories specified in the log.dirs configuration. - comma-separated list of paths. If more than one path is specified, the broker will store partitions on them in a “least-used” fashion with one partition’s log segments stored within the same path. Note that the broker will place a new partition in the path that has the
least number of partitions currently stored in it, not the least amount of disk space used in the following situations.

* **num.recovery.threads.per.data.dir** - number configured is per log directory specified with log.dirs. pool of threads for handling log segments. By default, only one thread per log directory is used 
  * When starting normally, to open each partition’s log segments
  * When starting after a failure, to check and truncate each partition’s log segments
  * When shutting down, to cleanly close log segments
 
* **auto.create.topics.enable** - DEFAULT true 
  * When a producer starts writing messages to the topic
  * When a consumer starts reading messages from the topic
  * When any client requests metadata for the topic
 
*  **default.replication.factor** for automatically created topics.
A replication factor of N allows you to lose N-1 brokers while still being able to read and write data to the topic reliably. Higher replication factor leads to higher availability, higher reliability, and fewer disasters

* **unclean.leader.election.enable** -- default true. If we allow out-of-sync replicas to become leaders, we risk data loss and data inconsistencies. If we set it to false, we choose to wait for the original leader to come back online, resulting in lower availability

* **min.insync.replicas** topic and the broker-level configuration are called min.insync.replicas. To 2, then you can only write to a partition in the topic if at least two out of the three replicas are in-sync -- Read-only mode.   **min.insync.replicas** only matters if **acks=all**

## Controller
The controller is one of the Kafka brokers that, in addition to the usual broker functionality, is responsible for electing partition leaders. The first broker that starts in the cluster
becomes the controller by creating an ephemeral node in ZooKeeper called **/controller**.

Kafka uses **Zookeeper’s ephemeral** node feature to elect a controller and to notify the controller when nodes join and leave the cluster. The controller is responsible for electing leaders among the partitions and replicas whenever it notices nodes join and leave the cluster. The controller uses the epoch number to prevent a “split brain” scenario where two nodes believe each is the current controller.

 Controller => one broker will also function as the cluster *controller* - There is only one controller in a cluster at all times.
   Admin operations:
   * Assigning partitions to brokers 
   * Monitoring for broker failures

The *leader of the partition* => partition is owned by a single broker in the cluster. A partition may be assigned to multiple brokers, which will result in the partition being replicated. Another broker can take over leadership if there is a broker failure. However, all consumers and producers operating on that partition must connect to the leader. 

# Topics
Messages in Kafka are categorized into **topics**. Topics are additionally broken down into a number of partitions
A topic typically has multiple partitions, there is no guarantee of message time-ordering across the entire topic, just within a single partition.

Replicas are spread across available brokers, and each replica = one broker. RF 3 = 3 brokers

Dynamic topic configurations are maintained in Zookeeper.

**Partitions** are also the way that Kafka provides redundancy and scalability. Each partition can be hosted on a different server, which means that a single topic can be scaled horizontally across multiple servers to provide performance far beyond the ability of a single server.

* **num.partitions** how many partitions a new topic is created with, primarily when automatic topic creation is enabled - DEFAULT 1 - 
**The number of partitions for a topic can only be increased, never decreased**

log-retention settings operate on log segments

* **log.retention.ms** The most common configuration for how long Kafka will retain messages is by time.
   log.retention.hours parameter, DEFAULT - 168 hours, or one week. 
   log.retention.minutes 
   log.retention.ms
  the smaller unit size will take precedence if more than one is specified.

* **log.retention.bytes** - applied per-partition - log.retention.bytes & log.retention.ms messages may be removed when either criteria is met

* **log.segment.bytes** - DEFAULT 1 GB

* **log.segment.ms** - The amount of time after which a log segment should be closed. --- NOT DEFAULT ---

* **message.max.bytes** - DEFAULT 1MB - (or 1000000) - impact I/O throughput
Coordinated with the consumer configuration **fetch.message.max.bytes** configuration on consumer amd the **replica.fetch.max.bytes**  

# Producers

**Producers** create new messages (publishers/writers). A message will be produced to a specific topic.

The producer does not care what partition a specific message is written to and will balance messages over all partitions of a topic evenly.
In some cases, the producer will direct messages to specific partitions. This is typically done using the message key and a partitioner that will generate a hash of the key and map it to a specific partition. This assures that all messages produced with a given key will get written to the same partition

Keys are necessary if you require strong ordering or grouping for messages that share the same key. If you require that messages with the same key are always seen in the correct order, attaching a key to messages will ensure messages with the same key always go to the same partition in a topic. Kafka guarantees order within a partition, but not across partitions in a topic, so alternatively not providing a key - which will result in round-robin distribution across partitions - will not maintain such order.

**ProducerRecord**, which must include the topic we want to send the record to and a value.
Optionally, we can also specify a *key* and/or a *partition*. Once we send the *ProducerRecord*, the first thing the producer will do is serialize the key and value objects to *ByteArrays* so they can be sent over the network. Next, the data is sent to a **partitioner**. If we specified a partition in the *ProducerRecord*, the partitioner doesn’t do anything and simply returns the partition we specified. If we didn’t, the *partitioner* will choose a partition for us, usually based on the *ProducerRecord key*. Once a partition is selected, the producer knows which topic and partition the record will go to. It then adds the record to a batch of records that will also be sent to the same topic and partition. A separate thread is responsible for sending those batches of records to the appropriate Kafka brokers.

When the broker receives the messages, it sends back a response. If the messages were successfully written to Kafka, it will return a **RecordMetadata** object with the topic, partition, and the offset of the record within the partition. If the broker failed to write the messages, it will return an error. When the producer receives an error, it
may retry sending the message a few more times before giving up and returning an error.

A producer object can be used by **multiple threads** to send messages

**Mandatory properties**

* **bootstrap.servers**: List of host:port pairs of brokers. 
* **key.serializer**: Name of a class that will be used to serialize the keys. Setting key.serializer is required even if you intend to send only values.
* **value.serializer**: Name of a class that will be used to serialize the values

**Methods**
* **Fire-and-forget**: We send a message to the server and don’t really care if it arrives succesfully or not. Most of the time, it will arrive successfully, since Kafka is highly available and the producer will retry sending messages automatically. However, some messages will get lost using this method.
* **Synchronous** send. We send a message, the send() method returns a Future object, and we use get() to wait on the future and see if the send() was successful or not.
* **Asynchronous** send: We call the send() method with a callback function, which gets triggered when it receives a response from the Kafka broker. *org.apache.kafka.
clients.producer.Callback* interface, which has a single function— *onCompletion()*.

Errors before sending the message to Kafka:  
  * **SerializationException** when it fails to serialize the message. 
  * **BufferExhaustedException** or **TimeoutException** if the buffer is full
  * **InterruptException** if the sending thread was interrupted.

KafkaProducer type of errors.  
  **Retriable** errors are those that can be resolved by sending the message again. For example, "Connection error".
   Some errors will not be resolved by retrying. For example, “message size too large.”  

## Prdoducer configuration 

* **acks** controls how many partition replicas must receive the record before the producer can consider the write successful.
  * **acks=0**: producer will not wait for a reply from the broker before assuming the message was sent successfully -- very high throughput
  * **acks=1**: producer will receive a success response from the broker the moment the leader replica received the message
  * **acks=all**: producer will receive a success response from the broker once all in-sync replicas received the message. -- safest mode 

* **buffer.memory** : This sets the amount of memory the producer will use to buffer messages waiting to be sent to brokers. 
  **block.on.buffer.full** parameter (replaced with **max.block.ms** in release 0.9.0.0, which allows blocking for a certain time and then throwing an exception).

* **compression.type**: By default, messages are sent uncompressed. This parameter can be set to *snappy*, *gzip*, or *lz4*. 

* **retries**: The value of the retries parameter will control how many times the producer will retry sending the message before giving up and notifying the client of an issue. By default, the producer will wait 100ms between retries, but you can control this using the **retry.backoff.ms** parameter.
 
* **batch.size** (in bytes!) controls how many bytes of data to collect before sending messages to the Kafka broker. Set this as high as possible, without exceeding available memory. Enabling compression can also help make more compact batches and increase the throughput of your producer. 
 
* **linger.ms** forces the producer to wait to send messages, hence increasing the chance of creating batches

* **client.id** This can be any string, and will be used by the brokers to identify messages sent from the client.  

* **max.in.flight.requests.per.connection** how many messages the producer will send to the server without receiving responses. Setting this to **1** will guarantee that messages will be written to the broker in the order in which they were sent.
 
* **request.timeout.ms**: how long the producer will wait for a reply from the server when sending data

* **metadata.fetch.timeout.ms**: how long the producer will wait for a reply from the server when requesting metadata

* **timeout.ms**: controls the time the broker will wait for in-sync replicas to acknowledge the message in order to meet the acks configuration—the broker will return an error if the time elapses without the necessary acknowledgments.
 
* **max.block.ms**: how long the producer will block when calling *send()* and when explicitly requesting metadata via *partitionsFor()*.

* **max.request.size**: This setting controls the size of a produce request sent by the producer.
the broker has its own limit on the size of the largest message it will accept (**message.max.bytes**). It is usually a good idea to have these configurations match, so the producer will not attempt to send messages of a size that will be rejected by the broker.

* **receive.buffer.bytes**: size of the TCP send buffer

* **send.buffer.bytes**: size of the TCP receive buffer

If these are set to -1, the OS defaults will be used.  

**Ordering Guarantees**
If guaranteeing order is critical, we recommend setting in.flight.requests.per.session=1 to make sure that while a batch of messages is retrying, additional messages will not
be sent.This will severely limit the throughput of the producer, so only use this when order is important.

# Consumers

**Consumers** read messages. (subscribers/readers). The consumer subscribes to one or more topics and reads the messages in the order in which they were produced. The consumer keeps track of which messages it has already consumed by keeping track of the *offset* of messages. 
Kafka does not track acknowledgments from consumers the way many JMS queues do. Instead, it allows consumers to use Kafka to track their position (offset) in each partition.

**commit**: Action of updating the current position in the partition. Consumer produces a message to Kafka, to a special **__consumer_offsets** topic, with the committed offset for each partition.

Consumers do not directly write to the __consumer_offsets topic, they instead interact with a broker that has been elected to manage that topic, which is the **Group Coordinator** broker

 **offset**: integer  -- Each message in a given partition has a unique offset.

 **Consumer group** => consumers that work together to consume a topic. When multiple consumers are subscribed to a topic and belong to the same consumer group, each consumer in
the group will receive messages from a different subset of the partitions in the topic.
Each partition is only consumed by one member. The mapping of a consumer to a partition is often called **ownership of the partition** by the consumer.
If we add more consumers to a single group with a single topic than we have partitions,some of the consumers will be idle and get no messages at all.
Multiple topics can be passed as a list or regex pattern.
Kafka transfers data with zero-copy and sends the raw bytes it receives from the producer straight to the consumer, leveraging the RAM available as page cache.

Moving partition ownership from one consumer to another is called a **rebalance**.
Rebalance is basically a short window of unavailability of the entire consumer group. Ehen partitions are moved from one consumer to another, the consumer loses its current state; if it was caching any data, it will need to refresh its caches—slowing down the application until the consumer sets up its state again.
The way consumers maintain membership in a consumer group and ownership of the partitions assigned to them is by sending heartbeats to a Kafka broker designated as the **group coordinator**

* If the committed offset is smaller than the offset of the last message the client processed, the messages between the last processed offset and the committed offset will
be **processed twice**

* If the committed offset is larger than the offset of the last message the client actually processed, all messages between the last processed offset and the committed offset
**will be missed** by the consumer group

* There are many different ways to implement **exactly-once** semantics by storing offsets and data in an external store, but all of them will need to use the 
**ConsumerRebalanceListener** and **seek()** to make sure offsets are stored in time and that the consumer starts reading messages from the correct location.

Closing the consumer will commit offsets if needed and will send the group coordinator a message that the consumer is leaving the group. The consumer coordinator will trigger rebalancing immediately and you won’t need to wait for the session to time out before partitions from the consumer you are closing will be assigned to another consumer in the group.

**assign()** can be used for manual assignment of a partition to a consumer, in which case **subscribe() must not be used**. Assign() takes TopicPartition object as an argument

 **auto.offset.reset=latest** 

 **at-most once consuming** scenario. Which offset commit strategy would you recommend? commit the offsets right after receiving a batch from a call to .poll(). 
 Before processing the data.

Consumer offsets are stored in a Kafka topic __consumer_offsets

In case the consumer has the wrong leader of a partition, it will issue a metadata request. The Metadata request can be handled by any node, so clients know afterwards which broker are the designated leader for the topic partitions. Produce and consume requests can only be sent to the node hosting partition leader.

* Always commit offsets after events were processed
* Commit frequency is a trade-off between performance and number of duplicates in the event of a crash
* Make sure you know exactly what offsets you are committing
* Rebalances
* Consumers may need to retry
* Consumers may need to maintain state
* Handling long processing times
* Exactly-once delivery
  * idempotent writes

**Mandatory properties**

* **bootstrap.servers**: List of host:port pairs of brokers. 
* **key.deserializer**: classes that can take a byte array and turn it into a Java object.
* **value.deserializer**: classes that can take a byte array and turn it into a Java object

* **group.id** : the consumer group the KafkaConsumer instance belongs to (Optional but always used)

**subcribe()** :
* List of topic names
* Regular expression

One consumer per thread is the rule.

## Consumer configuration

* **fetch.min.bytes**: minimum amount of data that the consumer wants to receive from the broker when fetching records.

* **fetch.max.wait.ms**: control how long to wait. Default 500ms

* **max.partition.fetch.bytes** : This property controls the maximum number of bytes the server will return per partition. Default 1MB.
  max.partition.fetch.bytes must be larger than the largest message a broker will accept

* **session.timeout.ms**: The amount of time a consumer can be out of contact with the brokers while still considered alive -- defaults to 3 seconds
   **heatbeat.interval.ms** must be lower than session.timeout.ms

* **auto.offset.reset** Default is **latest**. **earliest** to start consuming from beginning. For KSQL, SET 'auto.offset.reset'='earliest';
  **auto.offset.reset=none** means that the consumer will crash if the offsets it's recovering from have been deleted from Kafka

* **enable.auto.commit** Default is true
  **auto.commit.interval.ms** how frequently offsets will be committed. Default 5seg.

  AutoCommit=true, avoid duplicates is hard: Call to poll will always commit the last offset returned by the previous poll. It is critical to always process all the events returned by poll() before calling poll() again.
  
  AutoCommit=false, **commitSync()**. This API will commit the latest offset returned by poll() and return once the offset is committed, throwing an exception if commit fails for some reason. One drawback of manual commit is that the application is blocked until the broker responds to the commit request.
  Throughput can be improved by committing less frequently, but then we are increasing the number of potential duplicates that a rebalance will create.
  The drawback is that while commitSync() will retry the commit until it either succeeds or encounters a nonretriable failure, **commitAsync() will not retry**.

  * If the committed offset is smaller than the offset of the last message the client processed, the messages between the last processed offset and the committed offset will be processed twice
  * If the committed offset is larger than the offset of the last message the client actually processed, all messages between the last processed offset and the committed offset will be missed   by the consumer group
  
* **partition.assignment.strategy**
  **Range**: Assigns to each consumer a consecutive subset of partitions from each topic it subscribes to.
  **RoundRobin**: Takes all the partitions from all subscribed topics and assigns them to consumers sequentially, one by one.

* **client.id**: This can be any string, and will be used by the brokers to identify messages sent from the client.

* **max.poll.records**: This controls the maximum number of records that a single call to *poll()* will return. 

* **receive.buffer.bytes**: size of the TCP buffer
* **send.buffer.bytes**: sizes of the TCP buffer

Producer idempotence helps prevent the network introduced duplicates - **enable.idempotence=true**

# Retention 
The durable storage of messages for some period of time. Kafka brokers are configured with a default retention setting for topics, either retaining messages for some period of time or until the topic reaches a certain size in bytes. Once these limits are reached, messages are expired and deleted so that the retention configuration is a minimum amount of data available at any time. 
Individual topics can also be configured with their own retention settings. Topics can also be configured as *log compacted* => Kafka will retain only the last message produced with a specific key. This can be useful for changelog-type data, whereonly the last update is interesting.

# Multiple Clusters 

* Segregation of types of data
* Isolation for security requirements
* Multiple datacenters (disaster recovery)

The replication mechanisms within the Kafka lusters are designed only to work within a single cluster, not between multiple clusters.

**MirrorMaker** => Kafka consumer and producer, linked together with a
queue. Messages are consumed from one Kafka cluster and produced for another.


# Multiple Producers
# Multiple Consumers
# Disk-Based Retention
Consumers do not always need to work in real time. Durable retention
means that if a consumer falls behind, either due to slow processing or a burst in traffic, there is no danger of losing data.

# Scalable 
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

# Zookeeper

An ensemble is a set of *2n + 1* ZooKeeper servers where n is any number greater than 0. The odd number of servers allows ZooKeeper to perform majority elections for leadership. 

Different Kafka components subscribe to the **/brokers/ids** path in Zookeeper where brokers are registered so they get notified when brokers are added or removed.

**ACLs** are stored in Zookeeper node **/kafka-acls/** by default.

2181 - client port, 2888 - peer port, 3888 - leader port

Kafka components that are watching the list of brokers will be notified that the broker is gone.Even though the node representing the broker is gone when the broker is stopped,
the broker ID still exists in other data structures. For example, the list of replicas of each topic (see “Replication” on page 97) contains the broker IDs for the replica. This
way, if you completely lose a broker and start a brand new broker with the ID of the old one, it will immediately join the cluster in place of the missing broker with the
same partitions and topics assigned to it.

Dynamic topic configurations are stored in Zookeeper. 

# Replication

Replication is critical because it is the way Kafka guarantees availability and durability when individual nodes inevitably fail.
Each topic is partitioned, and each partition can have multiple replicas. Those replicas are stored on brokers, and each broker typically stores hundreds or even thousands of replicas belonging to different topics and partitions.

* **Leader replica**: Each partition has a single replica designated as the leader. All produce and consume requests go through the leader, in order to guarantee consistency.
* **Follower replica**: All replicas for a partition that are not leaders are called followers.Followers don’t serve client requests; their only job is to replicate messages from the leader
and stay up-to-date with the most recent messages the leader has.

The amount of time a follower can be inactive or behind before it is considered out of sync is controlled by the **replica.lag.time.max.ms** configuration parameter.

Kafka is configured with **auto.leader.rebalance.enable=true**, which will check if the preferred leader replica is not the current leader but is in-sync and trigger leader election
to make the preferred leader the current leader.

# Request processing

All requests sent to the broker from a specific client will be processed in the order in which they were received

**Headers**
* **Request type**: also called API key
* **Request version**: so the brokers can handle clients of different versions and respond accordingly
* **Correlation ID**: a number that uniquely identifies the request and also appears in the response and in the error logs  
* **Client ID**: used to identify the application that sent the request

The network threads are responsible for taking requests from client connections, placing them in a request queue, and picking up responses from a response queue and sending them back to clients.

Both produce requests and fetch requests have to be sent to the leader replica of a partition

## Metadata requests
Kafka clients use another request type called a **metadata** request, which includes a list of topics the client is interested in. The server response specifies which partitions exist in the topics, the replicas for each partition, and which replica is the leader. Metadata requests can be sent to any broker because all brokers have a metadata cache that contains this information.
Refresh intervals **metadata.max.age.ms** configuration parameter

## Producer requests
* If acks is set to 0 or 1, the broker will respond immediately.
* If acks is set to all, the request will be stored in a buffer called **purgatory** until the leader observes that the follower replicas replicated the message, at which point a response is sent to the client.

## Fetch Requests
* Clients also specify a limit to how much data the broker can return for each partition.
* If the offset exists, the broker will read messages from the partition, up to the limit set by the client in the request, and send the messages to the client. Kafka famously uses a **zero-copy** method to send the messages to the clients—this means that Kafka sends messages from the file directly to the network channel without any intermediate buffers. >> performance.
* Clients can also set a lower boundary on the amount of data returned, and define a timeout.
  “If you didn’t satisfy the minimum amount of data to send within x milliseconds, just send what you got.”
* **replica.lag.time.max.ms**—the amount of time a replica can be delayed in replicating new messages while still being considered in-sync.

# Physical storage 
**log.dirs**: list of directories in which the partitions will be stored

## Partition allocation 
* Spread replicas evenly among brokers
* For each partition, each replica is on a different broker
* If the brokers have rack information, then assign the replicas for each partition to different racks if possible

## File Management 
* Configures a retention period for each topic
* Split each partition into **segments**. As a Kafka broker is writing to a partition, if the segment limit is reached, we close the file and start a new one. The segment we are currently writing to is called an **active segment**. The active segment is never deleted

## File format
* Each segment is stored in a single data file
  * Kafka messages and their offsets
* This means that if you are using compression on the producer, sending larger batches means better compression both over the network and on the broker disks.

Kafka brokers ship with the **DumpLogSegment** tool, which allows you to look at a partition segment in the filesystem and examine its contents.

```
 bin/kafka-run-class.sh kafka.tools.DumpLogSegments
```

## Indexes 
Kafka maintains an index for each partition. The index maps offsets to segment files and positions within the file.
Indexes are also broken into segments, so we can delete old index entries when the messages are purged.

## Compaction 

Retention policy on a topic: 
* **delete**, which deletes events older than retention time
* **compact**, which only stores the most recent value for each key in the topic. If the topic contains null keys, compaction will fail. **log.cleaner.enabled**

The compact policy never compacts the current segment. Messages are eligble for compaction only on inactive segments.

# Guarantee

* Kafka provides order guarantee of messages in a partition.
* Produced messages are considered “committed” when they were written to the partition on all its in-sync replicas. Producers can choose to receive acknowledgments of sent messages when the message was fully committed, when it was written to the leader, or when it was sent over the network.
* Messages that are committed will not be lost as long as at least one replica remains alive
* Consumers can only read messages that are committed.

Having a message written in multiple replicas is how Kafka provides durability of messages in the event of a crash.

# Settings

Setting **unclean.leader.election.enable** to **true** means we allow out-of-sync replicas to become leaders, we will lose messages when this occurs, effectively losing credit card payments and making our customers very angry.
