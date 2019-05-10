---
title: KSQL
image: https://www.microshare.io/wp-content/uploads/2018/10/KSQL-Logo-New.png
date: 2019-04-24
description:
   Some KSQL notes. 
quote: FromSources Blog 
hashtags: kafka, ksql, confluent, apache, streaming
---

![An image](https://www.microshare.io/wp-content/uploads/2018/10/KSQL-Logo-New.png)

# KSQL

KSQL is the streaming SQL engine for Apache Kafka®. It provides an easy-to-use yet powerful interactive SQL interface for stream processing on Kafka, without the need to write code in a programming language.

KSQL is built on Kafka Streams, a robust stream processing framework that is part of Apache Kafka.

KSQL is not ANSI SQL compliant, for now there are no defined standards on streaming SQL languages

* **KSQL Server**: The KSQL server runs the engine that executes KSQL queries. This includes processing, reading, and writing data to and from the target Kafka cluster
* **KSQL CLI**:  You can interactively write KSQL queries by using the KSQL command line interface (CLI). The KSQL CLI acts as a client to the KSQL server.  

KSQL servers, clients, queries, and applications run outside of Kafka brokers, in separate JVM instances, or in separate clusters entirely.

* **KSQL Engine**
The KSQL engine executes KSQL statements and queries. You define your application logic by writing KSQL statements, and the engine builds and runs the application on available KSQL servers. Each KSQL server instance runs a KSQL engine. Under the hood, the engine parses your KSQL statements and builds corresponding Kafka Streams topologies.

* **REST Interface**
The REST server interface enables communicating with the KSQL engine from the CLI, Confluent Control Center, or from any other REST client.

**Data Definition Language (DDL) Statements**
Imperative verbs that define metadata on the KSQL server by adding, changing, or deleting streams and tables. Data Definition Language statements modify metadata only and don't operate on data. You can use these statements with declarative DML statements.

The DDL statements include:

* CREATE STREAM
* CREATE TABLE
* DROP STREAM
* DROP TABLE
* CREATE STREAM AS SELECT (CSAS)
* CREATE TABLE AS SELECT (CTAS)

**Data Manipulation Language (DML) Statements**
Declarative verbs that read and modify data in KSQL streams and tables. Data Manipulation Language statements modify data only and don't change metadata. The KSQL engine compiles DML statements into Kafka Streams applications, which run on a Kafka cluster like any other Kafka Streams application.

The DML statements include:

* SELECT
* INSERT INTO
* CREATE STREAM AS SELECT (CSAS)
* CREATE TABLE AS SELECT (CTAS)

# Deployment 

* **Interactive** – data exploration and pipeline development. KSQL shares statements with servers in the cluster over the command topic. The **command topic** stores every KSQL statement, along with some metadata that ensures the statements are built compatibly across KSQL restarts and upgrades.

* **Headless** – long-running production environments. The REST interface isn't available, so you assign workloads to KSQL servers by using a SQL file. The SQL file contains the KSQL statements and queries that define your application. KSQL stores metadata in an internal topic called the **config topic**.

KSQL enables distributing the processing load for your KSQL applications across all KSQL Server instances, and you can add more KSQL Server instances without restarting your applications.

Join KSQL engines to the same service pool by using the **ksql.service.id** property. 


# KSQL Query Lifecycle
 * Register a KSQL stream or table from an existing Kafka topic with a DDL statement, like **CREATE STREAM <my-stream> WITH <topic-name>**.
 * Express your app by using a KSQL statement, like **CREATE TABLE AS SELECT FROM <my-stream>**.
 * KSQL parses your statement into an abstract syntax tree (AST).
 * KSQL uses the AST and creates the logical plan for your statement.
 * KSQL uses the logical plan and creates the physical plan for your statement.
 * KSQL generates and runs the Kafka Streams application.
 * You manage the application as a STREAM or TABLE with its corresponding persistent query.

# KSQL vs KStreams

|               | KSQL          |  KStreams     |
| ------------- | ------------- | ------------- | 
| You write:    | KSQL statements  | JVM applications |
| Graphical UI  | Yes, in Confluent Control Center | No |
| Console | Yes |	No |
| Data formats |	Avro, JSON, CSV	| Any data format, including Avro, JSON, CSV, Protobuf, XML |
| REST API included	| Yes |	No, but you can implement your own |
| Runtime included	| Yes, the KSQL server	| Applications run as standard JVM processes |
| Queryable state	| No | Yes |

Usually, KSQL isn't a good fit for BI reports, ad-hoc querying, or queries with random access patterns, because it's a continuous query system on data streams.

# Time and Windows 

In KSQL, a record is an immutable representation of an event in time. Each record carries a **timestamp**. Timestamps are used by time-dependent operations, like aggregations and joins.

* **Event-time**: The time when a record is created by the data source.
* **Ingestion-time**: The time when a record is stored in a topic partition by a Kafka broker.
* **Processing-time**: The time when the record is consumed by a stream processing application.

Don't mix streams or tables that have different time semantics.

Topic -> **message.timestamp.type**
  * *CreateTime* - Event-time
  * *LogAppendTime* - Ingestion-time

By default, when KSQL imports a topic to create a stream, it uses the record's timestamp, but you can add the WITH(TIMESTAMP='some-field') clause to use a different field from the record's value as the timestamp

**Output Streams**

 * When new output records are generated by processing an input record directly, output record timestamps are inherited from input record timestamps.
 * When new output records are generated by a periodic function, the output record timestamp is defined as the current internal time of the stream task.
 * For aggregations, the timestamp of the resulting update record is taken from the latest input record that triggered the update.

## Window types

* Hopping Window:	Time-based & Fixed-duration, overlapping windows
* Tumbling Window	Time-based & Fixed-duration, non-overlapping, gap-less windows
* Session Window:	Session-based	& Dynamically-sized, non-overlapping, data-driven windows

KSQL supports using windows in JOIN queries by using the **WITHIN** clause 

SHOW STREAMS and EXPLAIN <query> statements run against the KSQL server that the KSQL client is connected to. They don’t communicate directly with Kafka. CREATE STREAM WITH <topic> and CREATE TABLE WITH <topic> write metadata to the KSQL command topic. Persistent queries based on CREATE STREAM AS SELECT and CREATE TABLE AS SELECT read and write to Kafka topics. Non-persistent queries based on SELECT that are stateless only read from Kafka topics, for example SELECT … FROM foo WHERE …. Non-persistent queries that are stateful read and write to Kafka, for example, COUNT and JOIN. The data in Kafka is deleted automatically when you terminate the query with CTRL-C.

