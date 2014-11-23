/**
 * Created by meshriva on 11/12/2014.
 */
var express = require('express');

/** Get all active circle users **/
exports.getAllActive =function(req,res){

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsers");

    circleUsers.find({circle_active:"true"}).then(function(circleUserMappings){

        // log the response received
        console.log(circleUserMappings);

        //  check if the response is not having the mapping result
        if(circleUserMappings ==undefined || circleUserMappings[0]== undefined || circleUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the circle mapping for"});
        }else{
            res.status(200).send({status: "success", reason:circleUserMappings});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });

}

/** Get the active current trust circles based on certain conditions **/
exports.customFind = function (req, res) {

    // get the request parameter
    var condition = req.body.condition;

    // display the condition
    console.log(condition);

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsers");

    circleUsers.find(condition).then(function(circleUserMappings){

        // log the response received
        console.log(circleUserMappings);

        //  check if the response is not having the mapping result
        if(circleUserMappings ==undefined || circleUserMappings[0]== undefined || circleUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the circle mapping for "+condition});
        }else{
            res.status(200).send({status: "success", reason:circleUserMappings});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });

}

/** Get current trust circles for a certain user to see the current active users**/
exports.findByUser = function(req,res){

    // get the request details for the user
    var user = req.params.user;

    console.log(user);

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsers");

    circleUsers.find({user:user,circle_active:"true"}).then(function(circleUserMappings){

        // log the response received
        console.log(circleUserMappings);

        //  check if the response is not having the mapping result
        if(circleUserMappings ==undefined || circleUserMappings[0]== undefined || circleUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the circle mapping for"+user});
        }else{
            res.status(200).send({status: "success", reason:circleUserMappings});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });
}

/** Delete all the circleUsers mapping based on trust Id**/
exports.deleteByTrustId = function(req,res){

    // get the variables from request
    var trustId = req.params.trustId;

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsers");

    // now lets remove the mapping also
    circleUsers.find({trustId:trustId}).then(function(circleUsers){
        if(circleUsers==undefined || circleUsers[0]==undefined){
            // no need to do anything
            console.log("Unable to store the circle mapping");
            res.status(400).send({status: "failure", reason:"Unable to store the circle mapping"});
        }else{
            circleUsers.forEach(function(circleuser){
                circleuser.del();
            });
            res.status(200).send({status: "success", reason:"Circle deleted"});
        }
    });
}

/** Delete the circleUsers mapping based on user **/
exports.deleteByUserAndTrustId = function(req,res){

// get the request details for the user
    var user = req.params.user;
    var trustId = req.params.trustId;

    console.log(user+" , "+trustId);

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsers");

    circleUsers.find({user:user,circle_active:"true",trustId:trustId}).then(function(circleUserMappings){

        // log the response received
        console.log(circleUserMappings);

        //  check if the response is not having the mapping result
        if(circleUserMappings ==undefined || circleUserMappings[0]== undefined || circleUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the circle mapping for"+user});
        }else{
            circleUserMappings.forEach(function(circleuser){
                circleuser.del();
            });
            res.status(200).send({status: "success", reason:"Circles mapping delete"});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });

}

/** Create a new mapping setting**/
exports.create = function(req,res){

    // get the data from request
    var user = req.body.user;
    var name = req.body.circle_name;
    var desc = req.body.circle_desc;
    var admin = req.body.circle_admin;
    var open = req.body.circle_open;
    var active = req.body.circle_active;
    var location = req.body.circle_location;
    var trustId = req.body.trustId;

    console.log(name+" , "+desc+" , "+admin+" , "+open+" , "+active+" , "+location+" , "+trustId);

    //Create a CircleUser object
    var circleUser = data.Object.ofType("CircleUsers",{
        "user":user,
        "circle_name":name,
        "circle_desc":desc,
        "circle_admin":admin,
        "circle_open":open,
        "circle_active":active,
        "circle_location":location,
        "trustId":trustId
    });

    circleUser.save().then(function(savedCircleUser){
        // mapping has been saved
        console.log("Successfully saved configuration for:"+user+" with circle:"+name);
        res.status(200).send({status: "success", reason:savedCircleUser});
    },function(err){
        //handle errors
        res.status(500).send({status: "success", reason:err});
    });
}

exports.subscribe = function (req, res) {

    // get the details from request
    var user = req.body.user;
    var name = req.body.circle_name;
    var desc = req.body.circle_desc;
    var admin = req.body.circle_admin;
    var open = req.body.circle_open;
    var active = req.body.circle_active;
    var location = req.body.circle_location;
    var trustId = req.body.trustId;

    console.log(name+" , "+desc+" , "+admin+" , "+open+" , "+active+" , "+location+" , "+trustId);

    // get data variable
    var data = req.data;

    //Create a CircleUser object
    var circleUser = data.Object.ofType("CircleUsersPending",{
        "user":user,
        "circle_name":name,
        "circle_desc":desc,
        "circle_admin":admin,
        "circle_open":open,
        "circle_active":active,
        "circle_location":location,
        "trustId":trustId
    });

    //Create a CircleUsersPending Query object
    var circleUserQuery = data.Query.ofType("CircleUsersPending");

    circleUserQuery.find({"user":user,"circle_admin":admin,"trustId":trustId}).then(function(currentObj){
        console.log(currentObj);

        if(currentObj !=undefined && currentObj[0]!=undefined){

            console.log("Sending duplicate file");
            res.status(200).send({status: "duplicate", reason: "Duplicate request"});
        }else {
            console.log("Going to try and save now");
            circleUser.save().then(function(savedCircleUser){
                // mapping has been saved
                console.log("Successfully saved configuration for:"+user+" with circle:"+name);
                res.status(200).send({status: "success", reason:savedCircleUser});
            },function(err){
                //handle errors
                res.status(500).send({status: "success", reason:err});
            });
        }
    },function(err){
        //handle errors
        res.status(500).send({status: "success", reason:err});
    });

}

/** method to get pending entries for circle **/
exports.findPendingEntriesByUser = function(req,res){

    // get the request details for the user
    var user = req.params.user;

    console.log(user);

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsersPending");

    circleUsers.find({circle_admin:user,circle_active:"true"}).then(function(circleUserMappings){

        // log the response received
        console.log(circleUserMappings);

        //  check if the response is not having the mapping result
        if(circleUserMappings ==undefined || circleUserMappings[0]== undefined || circleUserMappings[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the circle mapping for"+user});
        }else{
            res.status(200).send({status: "success", reason:circleUserMappings});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });

}

/** method to complete the pending circle request **/
exports.updatePendingRequestStatus = function (req, res) {

    // get the request from data
    var action = req.body.action;
    var user = req.body.user;
    var circle_name =req.body.circle_name;
    var circle_desc =req.body.circle_desc;
    var circle_admin =req.body.circle_admin;
    var circle_open =req.body.circle_open;
    var circle_active =req.body.circle_active;
    var circle_location=req.body.circle_location;
    var trustId = req.body.trustId;
    var status ="active";

    // print the data received
    console.log(action+" , "+user+" , "+circle_name+" , "+circle_desc+" , "+circle_admin+" , "+circle_open+" , "+circle_active+" , "+circle_location+" , "+trustId+" , "+status);

    // print the data received
    console.log(action+" , "+user+" , "+circle_name+" , "+circle_desc+" , "+circle_admin+" , "+circle_open+" , "+circle_active+" , "+circle_location+" , "+trustId+" , "+status);

    // get the IBM data from request
    var data = req.data;

    // Find objects with the tripUsers
    var circleUsers = data.Object.ofType("CircleUsers");
    // Find objects with TripUsersPendingRequest
    var circleUsersPendingRequest = data.Query.ofType("CircleUsersPending");


    if(action!=undefined && action =="allow"){
        // in this block we will delete the entries from TripUsersPendingRequest and
        // will create new entries on TripUsers
        circleUsers.set({
            "user":user,
            "circle_name":circle_name,
            "circle_desc":circle_desc,
            "circle_admin":circle_admin,
            "circle_open":circle_open,
            "circle_active":circle_active,
            "circle_location":circle_location,
            "trustId":trustId
        });

        circleUsers.save().then(function(savedCircleUsers){
            console.log(savedCircleUsers);
            if(savedCircleUsers!=undefined){
                console.log("In here");
                circleUsersPendingRequest.find({"trustId":trustId,"circle_admin":circle_admin,"user":user}).then(function(circleUsersPendingRequests){
                    console.log(circleUsersPendingRequests);
                    if(circleUsersPendingRequests!=undefined){
                        var count = 0;
                        var arrayCount = circleUsersPendingRequests.length;
                        circleUsersPendingRequests.forEach(function(data){
                            console.log(data);
                            data.del();
                            count ++;
                            if(count ==arrayCount) {
                                res.status(200).send({status: "success", reason: "update done"});
                            }
                        })
                    }else{
                        res.status(200).send({status: "success", reason: "update done"});
                    }
                });
            }
        },function(err){
            console.log(err);
            res.status(400).send({status: "failure", reason: "update failed"});
        })

    }else{
        // just delete the old entries
        circleUsersPendingRequest.find({"trustId":trustId,"circle_admin":circle_admin,"user":user}).then(function(circleUsersPendingRequests){
            if(circleUsersPendingRequests!=undefined){
                var count = 0;
                var arrayCount = circleUsersPendingRequests.length;
                circleUsersPendingRequests.forEach(function(data){
                    data.del();
                    count ++;
                    if(count ==arrayCount) {
                        res.status(200).send({status: "success", reason: "update done"});
                    }
                })
            }
        },function(err){
            console.log(err);
            res.status(400).send({status: "failure", reason: "update failed"});
        });
    }
}