---
title: Kafka Streams
image: https://mapr.com/blog/apache-kafka-and-mapr-streams-terms-techniques-and-new-designs/assets/streaming-post1.jpg
date: 2019-04-25
description:
   Some Apache Kafka Streams notes. 
quote: FromSources Blog 
hashtags: kafka, streams, confluent, apache, streaming
---

![An image](https://mapr.com/blog/apache-kafka-and-mapr-streams-terms-techniques-and-new-designs/assets/streaming-post1.jpg)

# Kafka Streams

Kafka’s reliable stream delivery capabilities make it a perfect source of data for stream-processing systems. Apache Storm, Apache Spark Streaming, Apache Flink, Apache Samza, ...

A **stream partition** is an, ordered, replayable, and fault-tolerant sequence of immutable data records, where a data record is defined as a key-value pair.

An application that uses the DSL API always starts with using the StreamBuilder to create a processing topology, a directed graph (DAG) of transformations that are applied to the events in the streams. Then you create a KafkaStreams execution object from the topology.

## Topology

A processor topology or simply topology defines the computational logic of the data processing that needs to be performed by a stream processing application. A topology is a graph of stream processors (nodes) that are connected by streams (edges).

Every streams application implements and executes at least one topology.

A topology always starts with one or more source processors and finishes with one or more sink processors.

The Streams engine parallelizes execution of a topology by splitting it into tasks. The number of tasks is determined by the Streams engine and depends on the number of partitions in the topics that the application processes.

Each task is responsible for a subset of the partitions: the task will subscribe to those partitions and consume events from them. For every event it consumes, the task will execute all the processing steps that apply to this partition in order before eventually writing the result to the sink. Those tasks are the basic unit of parallelism in Kafka Streams, because each task can execute independently of others.

* you will have as many tasks as you have partitions in the topics you are processing.

Kafka Streams handles this situation by assigning all the partitions needed for one join to the same task so that the task can consume from all the relevant partitions and perform the join independently. This is why Kafka Streams currently requires that all topics that participate in a join operation will have the same number of partitions and be partitioned based on the join key

Kafka Streams **repartitions** by writing the events to a new topic with new keys and partitions. Then another set of tasks reads events from the new topic and continues processing

Every Kafka Streams application must have an **application ID**.

The Kafka Streams application always reads data from Kafka topics and writes its output to Kafka topics.

When reading and writing data, our app will need to serialize and deserialize, so we provide default Serde classes. You need to remember to provide a Serde object for every object you want to store in Kafka

With the Kafka’s Streams API, you just start multiple instances of your app—and you have a cluster.

A KTable is a local cache that is updated through a stream of changes. In a stream-table join, each event in the stream receives information from the cached copy of the profile table.


# Kafka Streams

Although any Kafka Streams application is stateless as the state is stored in Kafka, it can take a while and lots of resources to recover the state from Kafka. In order to speed up recovery, it is advised to store the Kafka Streams state on a persistent volume, so that only the missing part of the state needs to be recovered.

**Stream as Table**: A stream can be considered a changelog of a table, where each data record in the stream captures a state change of the table.  *aggregating* data records in a stream will return a table. 

 **Table as Stream**: A table can be considered a snapshot, at a point in time, of the latest value for each key in a stream 

 * A **KStream** is an abstraction of a record stream, where each data record represents a self-contained datum in the unbounded data set. 
 * **KTable** is an abstraction of a changelog stream, where each data record represents an update. KTable also provides an ability to look up current values of data records by keys

 Effects of Kafka's log compaction: Another way of thinking about KStream and KTable is as follows: If you were to store a KTable into a Kafka topic, you'd probably want to enable Kafka's log compaction feature, e.g. to save storage space. However, it would not be safe to enable log compaction in the case of a KStream.

 A **GlobalKTable** differs from a KTable in the data that they are being populated with, i.e. which data from the underlying Kafka topic is being read into the respective table

  * More convenient and/or efficient joins: star joins, "foreign-key" lookups, more efficient when chaining multiple joins. Also, when joining against a global table, the input data does not need to be co-partitioned.
  * Can be used to "broadcast" information to all the running instances of your application.

  * Increased local storage consumption.
  * Increased network and Kafka broker load.

Kafka Streams assigns a **timestamp** to every data record via so-called timestamp extractors

* When new output records are generated via directly processing some input record, output record timestamps are inherited from input record timestamps directly.
* When new output records are generated via periodic functions, the output record timestamp is defined as the current internal time of the stream task.
* For aggregations, the timestamp of the resulting update record will be that of the latest input record that triggered the update.

* An **aggregation** operation takes one input stream or table, and yields a new table by combining multiple input records into a single output record. An input stream of an aggregation operation can be a KStream or a KTable, but the output stream will always be a KTable.

* **join** operation merges two input streams and/or tables based on the keys of their data records, and yields a new stream/table.

* **Windowing operations** are available in the Kafka Streams DSL. When working with windows, you can specify a **retention period** for the window. This retention period controls how long Kafka Streams will wait for out-of-order or late-arriving data records for a given window. If a record arrives after the retention period of a window has passed, the record is discarded and will not be processed in that window. **Windows** are tracked per record key.

* **Interactive queries** allow you to treat the stream processing layer as a lightweight embedded database, and to directly query the latest state of your stream processing application.
 
* **At-least-once semantics** - Records are never lost but may be redelivered - **processing.guarantee="at_least_once"** -- DEFAULT
* **Exactly-once semantics** - Records are processed once - **processing.guarantee="exactly_once"**. Using exactly-once, producers are configured for idempotent writes.

* **out-of-order data** 

  * **stateless** operations, will not impact processing logic 

  * **stateful** operations such as aggregations and joins, however, out-of-order data could cause the processing logic to be incorrect. 
      * wait for longer time while bookkeeping states during the wait time -- configure window operators for windowed aggregations   

* **Source Processor**: Produces an input stream to its topology from one or multiple Kafka topics by consuming records from these topics and forward them to its down-stream processors.
* **Sink Processor**: Sends any received records from its up-stream processors to a specified Kafka topic.

Kafka Streams uses the concepts of **stream partitions** and **stream tasks** as logical units of its parallelism model.

* Each stream partition is a totally ordered sequence of data records and maps to a Kafka topic partition.
* A data record in the stream maps to a Kafka message from that topic.
* The keys of data records determine the partitioning of data in both Kafka and Kafka Streams, i.e., how data is routed to specific partitions within topics.

The **assignment of stream partitions to stream tasks never changes**.
The maximum parallelism at which your application may run is bounded by the maximum number of stream tasks, which itself is determined by maximum number of partitions of the input topic(s) the application is reading from

Kafka Streams allows the user to configure the number of threads that the library can use to parallelize processing within an application instance. Each thread can execute one or more stream tasks with their processor topologies independently.

Kafka Streams provides so-called **state stores**, which can be used by stream processing applications to store and query data, which is an important capability when implementing stateful operations.

Specify the total memory (RAM) size that is used for an instance of a processing topology. This memory is used for **internal caching and compacting of records** before they are written to state stores, or forwarded downstream to other nodes.

Kafka Streams **does not use a backpressure mechanism** because it does not need one. Using a depth-first processing strategy, each record consumed from Kafka will go through the whole processor (sub-)topology for processing and for (possibly) being written back to Kafka before the next record will be processed. As a result, no records are being buffered in-memory between two connected stream processors.


# Stateless transformations
* Branch
* Filter
* Inverse Filter
* FlatMap
* FlatMap (values only)
* ForEach
* GroupByKey
* GroupBy
* Map
* Map (values only)
* Peek
* Print
* SelectKey
* Table to Stream

# Stateful Operations
[Stateful Operations](https://kafka.apache.org/20/documentation/streams/developer-guide/dsl-api.html#stateful-transformations)
* Join
* Reduce
* Aggreagate
* Count 
