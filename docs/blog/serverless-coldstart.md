---
title: Serverless Cold Start
image: https://media.defense.gov/2011/Mar/07/2000279865/1088/820/0/110110-F-0700L-030.JPG
date: 2019-01-10
description:
   What is a cold start? Factors which increase cold-start time?
quote: FromSources Blog 
hashtags: serverless, cold, start, lambda, aws
---

![An image](https://media.defense.gov/2011/Mar/07/2000279865/1088/820/0/110110-F-0700L-030.JPG)

# {{$page.frontmatter.title}}

**What is a cold start?** 
A latency experienced when you trigger a function. A cold start only happens if there is no idle container available waiting to run the code. 
A cold start happens when you execute an inactive (cold) function for the first time. It occurs while your cloud provider provisions your selected runtime container and then runs your function. This process, referred to as a cold start, will increase your execution time considerably. While you're actually running your function it will stay active (hot), meaning your container stays alive - ready and waiting for execution. But eventually after a period of inactivity, your cloud provider will drop the container and your function will become cold again.

Cold start happens once for each concurrent execution of your function.

Cold start performance is mainly relevant for APIs, where the added latency is user-facing.

Factors which increase cold-start time?
* The programming language  
* Memory size
* Code size
* VPC
* HTTPS calls
* Things that require classpath scan (Java)

You can have a cron job that runs every 5–10 mins and pings the API (with a special ping request), so that by the time the API is used by a real user it’ll hopefully be warm and the user would not be the one to have to endure the cold start time.
[serverless-plugin-warmup](https://github.com/FidelLimited/serverless-plugin-warmup)

[Yan Cui](https://medium.com/@theburningmonk) has done some experiments about cold start in lambda.  

* The idle timeout for lambda function is not a constant. AWS will kill your functions depending upon the resource’s demand/supply for the given AWS region.
* Higher the memory (RAM), the more time it stays warm. (This does not apply all the time)
* Statically typed languages (Java, C#) experience a higher cold start time than the dynamically typed languages (NodeJS, Python).
* Deployment package size does not affect the cold start time.
* Based on his experiments, we can assume that our functions stay idle at least 40 minutes. (Again, this does not apply all the time).
 
## Best Links about Cold Start

* [https://hackernoon.com/im-afraid-you-re-thinking-about-aws-lambda-cold-starts-all-wrong-7d907f278a4f](https://hackernoon.com/im-afraid-you-re-thinking-about-aws-lambda-cold-starts-all-wrong-7d907f278a4f)
* [https://docs.thundra.io/docs/how-to-warmup](https://docs.thundra.io/docs/how-to-warmup)
* [https://serverless.com/blog/keep-your-lambdas-warm/](https://serverless.com/blog/keep-your-lambdas-warm/)
* [https://medium.com/@lakshmanLD/resolving-cold-start%EF%B8%8F-in-aws-lambda-804512ca9b61](https://medium.com/@lakshmanLD/resolving-cold-start%EF%B8%8F-in-aws-lambda-804512ca9b61)
* [https://medium.com/thundra/dealing-with-cold-starts-in-aws-lambda-a5e3aa8f532](https://medium.com/thundra/dealing-with-cold-starts-in-aws-lambda-a5e3aa8f532)
* [https://hackernoon.com/cold-starts-in-aws-lambda-f9e3432adbf0?gi=fa947c63aa78](https://hackernoon.com/cold-starts-in-aws-lambda-f9e3432adbf0?gi=fa947c63aa78)
