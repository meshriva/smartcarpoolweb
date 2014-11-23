/**
 * Created by meshriva on 11/18/2014.
 */

var express = require('express');

/** Create a new trip **/
exports.create =function(req,res){

    // get the variables from request
    var creator = req.body.creator;
    var vechileRegisterationNumber = req.body.vechileRegisterationNumber;
    var vechileName = req.body.vechileName;
    var openSeats = req.body.openSeats;
    var startLocationCity =req.body.startLocationCity;
    var startLocationPlace = req.body.startLocationPlace;
    var startLocationLat = req.body.startLocationLat;
    var startLocationLang =req.body.startLocationLang;
    var startLocationDate = req.body.startLocationDate;
    var startLocationTime = req.body.startLocationTime;
    var endLocationCity =req.body.endLocationCity;
    var endLocationPlace =req.body.endLocationPlace;
    var endLocationLat = req.body.endLocationLat;
    var endLocationLang =req.body.endLocationLang;
    var endLocationDate = req.body.endLocationDate;
    var endLocationTime = req.body.endLocationTime;
    var open = req.body.open;
    var active = req.body.active;
    var trustId = req.body.trustId;
    var status = req.body.status;

    console.log(creator+" , "+vechileRegisterationNumber+" , "+vechileName+" , "+openSeats+" , "+startLocationCity+" , "+startLocationPlace+" , "+startLocationLat
    +" , "+startLocationLang+" , "+startLocationDate+" , "+startLocationTime+" , "+endLocationCity+" , "+endLocationPlace+" , "+endLocationLat+" , "+endLocationLang
    +" , "+endLocationDate+" , "+endLocationTime+" , "+open+" , "+active+" , "+trustId);

    // get the IBM data from request
    var data = req.data;

    //Create a circle object
    var trip = data.Object.ofType("Trips",{
        "creator":creator,
        "vechileRegisterationNumber":vechileRegisterationNumber,
        "vechileName":vechileName,
        "openSeats":openSeats,
        "startLocationCity":startLocationCity,
        "startLocationPlace":startLocationPlace,
        "startLocationLat":startLocationLat,
        "startLocationLang":startLocationLang,
        "startLocationDate":startLocationDate,
        "startLocationTime":startLocationTime,
        "endLocationCity":endLocationCity,
        "endLocationPlace":endLocationPlace,
        "endLocationLat":endLocationLat,
        "endLocationLang":endLocationLang,
        "endLocationDate":endLocationDate,
        "endLocationTime":endLocationTime,
        "open":open,
        "active":active,
        "trustId":trustId
    });

    // variables for notification tags
    var tags;
    var returnval;

    //Create a CircleUser object
    var tripUser = data.Object.ofType("TripUsers",{
        "creator":creator,
        "user":creator,
        "status":status
    });

    trip.save().then(function(savedTrip){
        // print the response form back end server
        console.log(savedTrip);

        //check if the response has some value
        if(savedTrip==undefined ||savedTrip._meta==undefined){
            res.status(500).send({status: "failure", reason:"Unable to store the trip"});
        }else {
            tags = savedTrip._meta.objectId;
            return savedTrip._meta.objectId;
        }

    }).then(function (objectId) {

        if(objectId==undefined){
            res.status(500).send({status: "failure", reason:"Unable to store the trip"})
        }else{
            // print the object received
            console.log(objectId);
            tripUser.set("tripId",objectId);
            return tripUser.save();
        }

    }).then(function(response){

        // print the response form back end server
        console.log(response);

        if(response==undefined || response._meta.objectId==undefined){
            res.status(500).send({status: "failure", reason:"Unable to store the trip users mapping"});
        }else{
            //res.status(200).send({status: "success", reason:response});
            returnval = response;
            return req.ibmpush.createTag(tags, "Trip Tag");
        }

    }, function (err) {
        res.status(500).send({status: "failure", reason:err});
    }).then(function(result){
        if(result!=undefined && returnval!=undefined){
            res.status(200).send({status: "success", reason:returnval});
        }else{
            res.status(500).send({status: "failure", reason:"Unable to store the trip users mapping"});
        }
    },function(err){
        res.status(500).send({status: "failure", reason:err});
    });

}


/** Custom Find Trip **/
exports.find = function(req,res){
    // get the data from request
    var tripQuery = req.body.tripQuery;

    // print the request recevied
    console.log(tripQuery);

    // get the IBM data from request
    var data = req.data;

    //Query object for Trips
    var trips = data.Query.ofType("Trips");

    trips.find(tripQuery).then(function(tripResults){

        // log the response received
        console.log(tripResults);

        //  check if the response is not having the mapping result
        if(tripResults ==undefined || tripResults[0]== undefined || tripResults[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the trip results"});
        }else{
            res.status(200).send({status: "success", reason:tripResults});
        }

    },function(err){
        res.status(500).send({status: "failure", reason:err});
    });
}

/** Get Trips based on user who has accepted the trip **/
exports.findActiveTripsByUser =function(req,res){
    // get the data from request
    var user = req.params.user;

    // print the user value
    console.log(user);

    // get the IBM data from request
    var data = req.data;

    //Query object for Trip Users
    var tripUsers = data.Query.ofType("TripUsers");

    var resultArray =[];
    tripUsers.find({user:user}).then(function(tripUserMappings){

        // log the response received
        console.log(tripUserMappings);

        //  check if the response is not having the mapping result
        if(tripUserMappings ==undefined || tripUserMappings[0]== undefined || tripUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the trip user mapping"});
        }else{
            return tripUserMappings;
        }

    }).then(function(tripUsersDetails){
        // get the count of tripUsersDetails
        var tripUsersDetailsLength =  tripUsersDetails.length;
        var count =0;
        console.log("Count of tripUsersDetails "+tripUsersDetailsLength);

        tripUsersDetails.forEach(function(tripUsersDetails){

            console.log(tripUsersDetails.attributes.tripId);
            data.Object.withId(tripUsersDetails.attributes.tripId).then(function(response){
                count++;
                if (response != undefined) {
                    console.log(response);
                    // check here the status is active for the trip details
                    resultArray.push(response);
                    if(count==tripUsersDetailsLength){
                        console.log("count is same:"+count+":"+tripUsersDetailsLength);
                        res.status(200).send({status: "success", reason: resultArray});
                    }
                } else {
                    res.status(500).send({status: "failure", reason: "unable to get the trip user mapping"});
                }

            })
        })
    },function(err){
        res.status(500).send({status: "failure", reason:err});
    })
}

