/**
 * Created by meshriva on 10/31/2014.
 */
var express = require('express');


/* Add a new task*/
exports.create =
     function(req, res) {
    // get the request values from body
    var taskname = req.body.name;
    var taskdescription = req.body.description;

    // print the received values on the console
    console.log("Body "+req.body.tag+"Task name " + taskname + ",Task description " + taskdescription);

    req.ibmpush.createTag(taskname, taskdescription)
        .then(function (response) {
            console.log("Tag successfully created");
            res.send("Tag "+taskname+" successfully created");
        },function(err) {
            console.log(err);
            res.status(400).send({reason: "Tag "+taskname+" creation failed", error: err});
        });

};

/* Query all the tasks */
exports.getAll = function (req,res) {

    req.ibmpush.getTags()
        .then(function (tagList) {
        if(response && response.tags.length)
        {
            var tags = response.tags;
            //Fetch the detail of each tag
            for(var i=0 ; i<tags.length;i++)
            {
                var name = tags[i].name;
                push.getTagDetail(name)
                    .then(function (tagDetail) {
                        console.log(tagDetail);
                    }, function (err) {
                        console.log(err);
                    });
            }
        }
            res.send(tags);
    },function(err) {
            console.log(err);
            res.status(400).send({reason: "Error while getting Tasks", error: err});
    });

};

/* Query a certain task */
exports.getTagByName =function(req,res){

    // get the name from the query parameter
    var name = req.params.taskname;

   req.ibmpush.getTagDetail(name)
       .then(function(tagDetail){
            console.log(tagDetail);
            res.send(tagDetail);
       },function(err){
           console.log(err);
           res.status(400).send({reason: "Error while getting Tasks for"+name, error: err});
       }
   );
};

/* Update a certain task*/
exports.getTagDescription =function(req,res){

    //get name and description form query parameter
    var name = req.params.taskname;
    var description = req.params.taskdescription;

    req.ibmpush.updateTagDescription(name,description)
        .then(function(tagDetail){
            console.log(tagDetail);
            res.send(tagDetail);
        },function(err){
            console.log(err);
            res.status(400).send( {reason: "Error while updating Tasks for"+name, error: err});
        }
    );
};

/* Delete a certain task **/
exports.deleteTag = function(req,res){
    // get the name from the query parameter
    var name = req.params.taskname;

    req.ibmpush.deleteTag(name)
        .then(function(){
            console.log("Task "+name+" deleted");
            res.send("Task "+name+" deleted");
        },function(err){
            console.log(err);
            res.status(400).send( {reason: "Task "+name+" deletion failed", error: err});
        }
    );
};

/** Post a notification message to specific tasks **/
exports.sendMessageByTags= function(req,res){
   //get the payloads from request
    var message = req.body.message;
    var tags = req.body.tags;
    //harcoded this to blank for now , will take this value from client
    var settings = {};

    req.ibmpush.sendNotificationByTags(message,tags,settings)
        .then(function (response) {
            console.log("Notification sent successfully to all devices.", response);
            res.send("Sent notification to all required devices for task."+tags);
        }, function(err) {
            console.log("Failed to send notification to all devices.");
            console.log(err);
            res.status(400).send({reason: "An error occurred while sending the Push notification.", error: err});
        });
};

/** Post a notification message to all devices **/
exports.sendMessage =function(req,res){

    //get the payload from request
    var message = req.body.message;
    var results = 'Sent notification to all registered devices successfully.';

    console.log("Trying to send push notification via JavaScript Push SDK");

    req.ibmpush.sendBroadcastNotification(message,null).then(function (response) {
        console.log("Notification sent successfully to all devices.", response);
        res.send("Sent notification to all registered devices.");
    }, function(err) {
        console.log("Failed to send notification to all devices.");
        console.log(err);
        res.status(400).send( {reason: "An error occurred while sending the Push notification.", error: err});
    });
};

