/**
 * Created by meshriva on 11/18/2014.
 */

var express = require('express');

/** Create a new trip users mapping  **/
exports.create =function(req,res){

    // get the variables from request
    var tripId = req.body.tripId;
    var creator = req.body.creator;
    var user = req.body.user;
    var status = req.body.status;

    console.log(tripId+" , "+creator+" , "+user+" , "+status);

    // get the IBM data from request
    var data = req.data;

    //Query object for TripUsers
    var tripUserQuery = data.Object.ofType("TripUsers",{
        "tripId":tripId,
        "creator":creator,
        "user":user,
        "status":status
    });

    tripUserQuery.save().then(function(tripUser){
        // print the response form back end server
        console.log(tripUser);
        if(tripUser!=undefined) {
            res.status(200).send({status: "success", reason: tripUser});
        }else{
            res.status(500).send({status: "success", reason: "Unable to store details"});
        }
    }),function(err){
        //handle errors
        console.error(err);
        res.status(500).send({status: "failure", reason:err});
    }

}


/** Update the status of TripUser mapping **/
exports.updateStatus =function(req,res){

    // get the data from request
    var status = req.body.status;
    var user =  req.body.user;
    var tripId = req.body.tripId;

    // print the logs
    console.log(status+" , "+tripId+" , "+user);

    // get the IBM data from request
    var data = req.data;

    //Query object for Trip Users
    var tripUsers = data.Query.ofType("TripUsers");

    //Query object for Trip
    var trips = data.Query.ofType("Trips");

    tripUsers.find({tripId:tripId,user:user}).then(function(tripUserMappings){

        // log the response received
        console.log(tripUserMappings);

        //  check if the response is not having the mapping result
        if(tripUserMappings ==undefined || tripUserMappings[0]== undefined || tripUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the trip user mapping"});
        }else{

            // need additional logic here to safegaurd user updating the status for exclusive trips
            tripUserMappings[0].set("status",status);
            tripUserMappings[0].set("user",user);
            tripUserMappings[0].set("tripId",tripId);
            return tripUserMappings[0].save();
        }

    }).then(function (response) {
       console.log(response);
        if(response!=undefined){
            res.status(200).send({status: "success", reason:response});
        }else{
            res.status(500).send({status: "failure", reason:"Unable to update the trip user mapping"});
        }

    },function(err){
        res.status(500).send({status: "failure", reason:err});
    });

}

/** Find TripUser mapping by tripId **/
exports.findByTripId =function(req,res) {

    // get the request details
    var tripId = req.params.tripId;

    // print the data
    console.log(tripId);

    // get the IBM data from request
    var data = req.data;

    //Query object for Trip Users
    var tripUsers = data.Query.ofType("TripUsers");

    tripUsers.find({tripId:tripId}).then(function(tripUserMappings){

        // log the response received
        console.log(tripUserMappings);

        //  check if the response is not having the mapping result
        if(tripUserMappings ==undefined || tripUserMappings[0]== undefined || tripUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the trip user mapping"});
        }else{
            res.status(200).send({status: "success", reason:tripUserMappings});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });

}

/** called when a user tries to subscribe for a trip **/
exports.subscribe =function(req,res){

    // get the data from request
    var trustId = req.body.trustId;
    var tripId = req.body.tripId;
    var creator = req.body.creator;
    var user = req.body.user;
    var status = req.body.status;

    // print the response
    console.log(trustId+" , "+tripId+" , "+creator+" , "+user+" , "+status);

    // get the IBM data from request
    var data = req.data;

    var obj;
    var query;
    var alert;
    // based on trust id decide where the request should be stored
    if(true){
        alert = user+" has joined the trip";
        obj = data.Object.ofType("TripUsers",{
            "tripId":tripId,
            "creator":creator,
            "user":user,
            "status":status
        });
        query = data.Query.ofType("TripUsers");
    }else{
        alert = user+" has requested to join the trip";
        obj = data.Object.ofType("TripUsersPendingRequest",{
            "tripId":tripId,
            "creator":creator,
            "user":user,
            "status":status
        });
    }

    var result;

    var message = {
        alert : alert,
        url : "https://www.bluemix.net"
    }
    var tags = [tripId];
    //harcoded this to blank for now as no settings specific to push notification planned
    var settings = {};

    query.find({
        "tripId":tripId,
        "creator":creator,
        "user":user,
        "status":status
    }).then(function(currentObj){
        console.log(currentObj);

        if(currentObj !=undefined && currentObj[0]!=undefined){

            console.log("Sending duplicate file");
            res.status(200).send({status: "duplicate", reason: "Duplicate request"});
        }else{
            console.log("Going to try and save now");
            obj.save().then(function(tripUser){
                // print the response form back end server
                console.log(tripUser);
                if(tripUser!=undefined) {
                    //res.status(200).send({status: "success", reason: tripUser});
                    result = tripUser;
                    return req.ibmpush.sendNotificationByTags(message,tags);
                }else{
                    res.status(500).send({status: "failure", reason: "Unable to store details"});
                }
            }).then(function(response){
                if(response!=undefined){
                    res.status(200).send({status: "success", reason: result});
                }else{
                    res.status(500).send({status: "failure", reason: "Unable to store details"});
                }
            },function(err){
                //handle errors
                console.error(err);
                res.status(500).send({status: "failure", reason:err});
            },function(err){
                //handle errors
                console.error(err);
                res.status(500).send({status: "failure", reason:err});
            });

        }

    });
}

/** called when a creator of trip takes decision on trip subscription request **/
exports.decision =function(req,res){
    // get the request from data
    var action = req.body.action;
    var creator = req.body.creator;
    var user = req.body.user;
    var tripId = req.body.tripId;
    var status =req.body.status;

    // print the data received
    console.log(action+" , "+creator+" , "+user+" , "+tripId+" , "+status);

    // get the IBM data from request
    var data = req.data;

    // Find objects with the tripUsers
    var tripUsers = data.Object.ofType("TripUsers");
    // Find objects with TripUsersPendingRequest
    var tripUsersPendingRequest = data.Query.ofType("TripUsersPendingRequest");


    if(action!=undefined && action =="allow"){
        // in this block we will delete the entries from TripUsersPendingRequest and
        // will create new entries on TripUsers
        tripUsers.set({
            "tripId":tripId,
            "creator":creator,
            "user":user,
            "status":status
        });

        tripUsers.save().then(function(savedTripUsers){
            if(savedTripUsers!=undefined){
                tripUsersPendingRequest.find({"tripId":tripId,"creator":creator,"user":user}).then(function(tripUsersPendingRequests){
                    if(tripUsersPendingRequests!=undefined){
                        tripUsersPendingRequests.forEach(function(data){
                            data.del();
                            res.status(200).send({status: "success", reason: "update done"});
                        })
                    }
                });
            }
        },function(err){
            console.log(err);
            res.status(400).send({status: "failure", reason: "update failed"});
        })

    }else{
        // just delete the old entries
        tripUsersPendingRequest.find({"tripId":tripId,"creator":creator,"user":user}).then(function(tripUsersPendingRequests){
            if(tripUsersPendingRequests!=undefined){
                tripUsersPendingRequests.forEach(function(data){
                    data.del();
                    res.status(200).send({status: "success", reason: "update done"});
                })
            }
        },function(err){
            console.log(err);
            res.status(400).send({status: "failure", reason: "update failed"});
        });
    }
}