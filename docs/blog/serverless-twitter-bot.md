---
title: Serverless Twitter Bot 
image: https://www.iab.com/wp-content/uploads/2014/09/iababc-international-spiders-and-bots-list.jpg
date: 2018-11-10
description:
   Build a Serverless Twitter Bot with AWS Lambda and the Serverless framework.
quote: FromSources Blog 
hashtags: serverless, twitter, bot, lambda, aws
---


![An image](https://www.iab.com/wp-content/uploads/2014/09/iababc-international-spiders-and-bots-list.jpg)

# {{$page.frontmatter.title}}

This is my first [Twitter](https://twitter.com) Bot. The goal is to tweet jokes every 2 hours. This is a challenge from *#NoServerNovember* challenge from the [Serverless Framework](https://serverless.com/framework/) team. The longest part was to create the Twitter account and got the API Keys from Twitter.

## Stack: 
<br/>
<img src="https://avatars3.githubusercontent.com/u/13742415?s=400&v=4" width="100" height="100">
<img src="https://www.stratoscale.com/wp-content/uploads/AWS-Lambda.png" width="100" height="100">
<img src="https://pbs.twimg.com/profile_images/1013798240683266048/zRim1x6M.jpg" width="100" height="100">
<img src="https://icanhazdadjoke.com/static/smile.png" width="100" height="100">
<br/><br/>

* [Serverless Framework](https://serverless.com/framework/)
* [AWS Lambda](https://aws.amazon.com/lambda/) 
* [Twitter API](https://developer.twitter.com/en/docs.html) 
* The [Dad Joke API](https://icanhazdadjoke.com/) 

## Steps  
<br/>

* Install de Serverles Framework   

```bash
  $  npm i serverless -g
``` 


* Configure AWS provider credentials. [Guide](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

```bash
 $  serverless config credentials --provider aws --key <YOUR_AWS_KEY> --secret <YOUR_AWS_SECRET>
``` 

* Create the project using *NodeJS* template. [Guide](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)

```bash
$ serverless create --template aws-nodejs --path serverless-twitter-bot 
``` 

and then:

```bash 
$ cd serverless-twitter-bot
``` 

* Create a *package.json* for NPM

```bash
$ npm init 
``` 

* Add [**Axios**](https://github.com/axios/axios) dependency, I used Axios as request API for [NodeJS](https://nodejs.org). Axios is a great package and it is very easy to use, a very good alternative could be [**node-fetch**](https://www.npmjs.com/package/node-fetch).  

```bash
$ npm i axios 
``` 

* Add [Twitter API client](https://www.npmjs.com/package/twitter) for NodeJs. There are differents Twitter clients for NodeJs. This one seems very popular and very easy to use. 

```bash
$ npm i twitter 
``` 

* Create a Twitter account and get API Keys and Secrets. An e-mail account and a mobile number is needed to create the account, then go to [Developer Twitter](https://developer.twitter.com/en/docs.html) and fill the form to create an application and get the Keys, this is the longest part of the whole process.   

* Serverless configuration - *serverless.yml*:
   - The provider information (Runtime, Region, Stage, etc) 
   - The Twitter keys are configured as Environment variables. 
   - The Function handler and the Event, in this case, a scheduled event.  

```yaml
provider:
  name: aws
  runtime: nodejs8.10 
  stage: dev
  region: eu-central-1
  environment:
    CONSUMER_KEY: #CONSUMER_KEY_HERE"
    CONSUMER_SECRET: #CONSUMER_SECRET_HERE#
    ACCESS_TOKEN_KEY: #ACCESS_TOKEN_KEY_HERE#
    ACCESS_TOKEN_SECRET: #ACCESS_TOKEN_SECRET_HERE#

functions:
  bot:
    handler: handler.bot
    events:
      - schedule: rate(2 hours)
``` 
 
## Coding 

  * Connecting to Twitter, initialize the Twitter object with Keys: 

```js 
const Twitter = require('twitter');

const tw = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});
```

  * Handler: 
    * The [Dad Joke API](https://icanhazdadjoke.com/) needs the *User-Agent* header, the Twitter Bot account name is used in this case. 
    * *Async / Await* is used for easily handling the flow.  

```javascript
module.exports.bot = async () => {
  try {
    const jokeResponse = await axios({
      url: 'https://icanhazdadjoke.com/',
      headers: {
        'Accept': 'application/json',
        'User-Agent': '@TheMonkeyJoker1'
      }
    }); 
    await tw.post('statuses/update', {
      status: jokeResponse.data.joke
    });
  } catch (err) {
    console.log('Error:' + err.message);
  }
}
```

## Deploy

```bash 
$ serverless deploy
``` 

If everything was fine with the AWS deployment, we'll have our Lambda function tweeting every 2hrs. 

<img :src="$withBase('/twitter-bot.png')" alt="twitter-bot"> 

## Sources 
<v-icon>fab fa-github </v-icon>
[GitHub](https://github.com/marcelogft/serverless-twitter-bot)  




