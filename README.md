Smart Pool Web 
===

Smart Pool Web code is the Node.js runtime code used for both the Android and its internal web application as Cloud service.The other part is a web application written in express framework which connects to the cloud service

This project provides a web based solution for Smarter Car Pooling solution. The solution is based on IBM Bluemix 
capabilities ,and it used IBM services for exposing a cloud service,push notification and IBM mobile data for persistence. 

Prerequisite's
---
Before you can run the sample you need to install the prerequisite software components.

Download the [Cloud Foundry CLI version 6](https://github.com/cloudfoundry/cli/releases), and choose the installer appropriate for the system from which you will run the CLI.

Running this sample
---

To test the Node.js code you need to have created a Mobile Cloud Boilerplate application with [IBM Bluemix](http://bluemix.net) and you need to make a note of your application id.

### Configuration

You need to modify the ```app.js``` file with your own corresponding application id and application route.
Code is already with a current applicationId and applicationRoute, and it can be deployed as it 

```javascript
//configuration for application
var appConfig = {
    applicationId: "<INSERT_APP_ID>",
    applicationRoute: "<INSERT_APP_ROUTE>"
};
```

### Deploy to Bluemix
1. Open a command prompt and go to the directory containing the bluelist-push-node code.
```bash
cd <git repository>/bluelist-push/bluelist-push-node
```
2. Verify the Cloud Foundry CLI is installed.
```bash
cf --version 
```
3. Log in to Bluemix from the CLI
```bash
cf login -a https://ace.ng.bluemix.net
```
4. Push (upload) the bluelist-push-node application up to the Bluemix Node.js runtime.
```bash
cf push ${yourAppName} -p . -m 512M
```
Note: remember to change manifest.mf with your own ```appName```
