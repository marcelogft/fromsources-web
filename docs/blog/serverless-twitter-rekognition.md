---
title: Serverless Twitter Bot + Image Rekognition
date: 2018-11-20
image: http://www.ciobulletin.com/home_image/ciobulletin-amazons-facial-recognition-hits-the-streets-of-orlando.jpg
description:
   Twitter Bot + AWS Rekognition
quote: FromSources Blog 
hashtags: serverless, twitter, bot, lambda, aws
---

![An image](http://www.ciobulletin.com/home_image/ciobulletin-amazons-facial-recognition-hits-the-streets-of-orlando.jpg)

# {{$page.frontmatter.title}}

This is a challenge from *#NoServerNovember* challenge from the [Serverless Framework](https://serverless.com/framework/) team. 
The challenge was to make a serverless, image-recognition-backed Twitter bot. When a user tweets at the bot: “@animalbot, what’s in this image?”, the bot should reply with the name image content.

## Summary

1. Get bot twitter mentions from the last tweet Id processed. Query DynamoDB to get the last Id.
2. Search for 'image?' string
3. Get the first image from the tweet 
4. Use AWS Rekognition to get image *Labels* 
5. Tweet response with the labels 
6. Save the Tweet Id into DynamoDB

## Stack
<br/>
<img src="https://avatars3.githubusercontent.com/u/13742415?s=400&v=4" width="100" height="100">
<img src="https://www.stratoscale.com/wp-content/uploads/AWS-Lambda.png" width="100" height="100">
<img src="https://pbs.twimg.com/profile_images/1013798240683266048/zRim1x6M.jpg" width="100" height="100">
<img src="https://www.outsystems.com/Forge_CW/_image.aspx/A28atdGCIn2i_ZW11S_0KWgJm3iqRSfV9G8=/amazon-rekognition" width="100" height="100">
<br/><br/>

* [Serverless Framework](https://serverless.com/framework/)
* [AWS Lambda](https://aws.amazon.com/lambda/) 
* [Twitter API](https://developer.twitter.com/en/docs.html) 
* [AWS Rekognition](https://aws.amazon.com/es/rekognition/) 

## Twitter Bot 

Check this article for building a Twitter Bot:
[Building a Twitter Bot with Serverless and AWS Lambda](https://marcelogft.github.io/fromsources-web/blog/serverless-twitter-bot.html)

## Tweeter mentions 

The Twitter API provides a mentions endpoint, we can use the *since_id* parameter to handle and process tweets. Since AWS Lambda is stateless, we can use DynamoDB to store the last Tweet ID processed by the bot. 

### Manage ID with DynamoDB

Build two functions to get / save the Id. 

```js 
let options = {};
// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}
const client = new AWS.DynamoDB.DocumentClient(options);

const get = () => { 
  const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: 'last',
      },
    }; 
    return client.get(params).promise().then ((data) => data); 
}

const save = (id) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: 'last',
      data: id
    },
  }; 
  // write to the database
  return client.put(params).promise().then ((data) => data); 
};

```

Get the Twitter account mentions, using the *since_id* parameter, then filter the *"image?"* text.

```js 
const lastId = await get();  
if (!lastId.Item) {
  lastId.Item = {}
  lastId.Item.data = '1'
}
const mentions = await tw.get('statuses/mentions_timeline', {since_id: lastId.Item.data}).then(tweets => tweets.filter(item => item.text.indexOf('image?') > -1));
```

Get Images from the mentions response. The code gets only the first mention, and then gets the first media URL from it. If the mention has more than one image attached, only the first one will be processed.

```js 
if (mentions && mentions.length > 0) {
    const tweet = mentions[0]; 
    if (tweet.entities.media.length > 0) {    
      const imgBytes = await getImageData(tweet.entities.media[0].media_url)
```

We need to get the image bytes as we only have the URL from Twitter.

```js 
const getImageData = async (url) => {
  try {
      const response = await fetch(url);
      const data = await response.buffer();
      return data;
  } catch (error) {
      console.log(error);
  }
};
```

## AWS Rekognition 

We can call now the AWS Rekognition API to detect the image Labels.

```js 
const rekognition = new AWS.Rekognition();

const params = {
  Image: {            
    Bytes: imgBytes
  },
  MaxLabels: 5,
  MinConfidence: 75,
};

const data = await rekognition.detectLabels(params).promise().catch(err => console.log(err));
```
## Tweet the response
 
If AWS Rekognition detected labels for the image, we need to build the response, mentioning the requester and replaying the tweet using the incoming Tweet ID. **in_reply_to_status_id** parameter will be needed for that. 

The last step is to save the processed Tweet Id into DynamoDB. 

```js
 if (data.Labels && data.Labels.length > 0) {
   const tweeted = await tw.post('statuses/update', {
         status: '@' + tweet.user.screen_name + " " +  "I can see: " + data.Labels.map (label => label.Name).join(', '),
         in_reply_to_status_id: tweet.id_str}) 
   save(tweet.id_str);
 } 
```

## Serverless configuration

Function is scheduled to check mentions every 10 minutes. 

```yaml
service: serverless-bot-rek 
provider:
  name: aws  
  runtime: nodejs8.10 
  stage: dev
  region: eu-west-1
  environment:
    CONSUMER_KEY: TWITTER_CONSUMER_KEY
    CONSUMER_SECRET: TWITTER_CONSUMER_SECRET
    ACCESS_TOKEN_KEY: TWITTER_ACCESS_TOKEN_KEY
    ACCESS_TOKEN_SECRET: TWITTER_ACCESS_TOKEN_SECRET
    DYNAMODB_TABLE: ${self:service}-${opt:stage, self:provider.stage}
  iamRoleStatements:
    - Effect: Allow
      Action: 
        - dynamodb:GetItem
        - dynamodb:PutItem 
      Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"
    - Effect: Allow
      Action:
        - rekognition:DetectLabels
      Resource: "*"  
functions:
  rekbot:
    handler: handler.rek 
    events:
      - schedule: rate(10 minutes)
resources:
  Resources:
    TodosDynamoDbTable:
      Type: 'AWS::DynamoDB::Table'
      DeletionPolicy: Retain
      Properties:
        AttributeDefinitions:
          -
            AttributeName: id
            AttributeType: S
        KeySchema:
          -
            AttributeName: id
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
plugins:
  - serverless-dynamodb-local
  - serverless-offline
custom:
  dynamodb:
    start:
      port: 8000
      inMemory: true
      migrate: true
    migration:
      dir: offline/migrations

```

::: tip
 *serverless-offline* plugin was used to test the function locally using HTTP endpoint to execute manually the function. There are other plugins like [*serverless-local-schedule*](https://www.npmjs.com/package/serverless-local-schedule) or [*serverless-offline-scheduler*](https://www.npmjs.com/package/serverless-offline-scheduler) to schedule locally. 
:::

::: tip
 [*serverless-dynamodb-local*](https://www.npmjs.com/package/serverless-dynamodb-local*) plugin was used to run a local DynamoDB instance. 
:::


## Result
If deployment was fine we can tweet the bot: 

<img :src="$withBase('/twitter-bot-rek.png')" alt="twitter-bot"> 

## Sources
<v-icon>fab fa-github </v-icon>
[GitHub](https://github.com/marcelogft/serverless-twitter-bot-rek)  
