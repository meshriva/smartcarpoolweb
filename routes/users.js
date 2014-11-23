/**
 * Created by meshriva on 11/6/2014.
 */
var express = require('express');

/** Verify credentials for the user **/
exports.authenticate =function(req,res){

    // get the request values from body
    var email = req.body.email;
    var password = req.body.password;

    // print the received values on the console
    console.log("User name : "+email+" and password: "+password);

    var allUser = req.data.Query.ofType("User");

    try {
        //Find objects with particular name
        allUser.find({email: email}).then(function (users) {
            // verify if the user name exists
            if (users[0]!=undefined) {
                console.log("the password in the back end for" + users[0].attributes.email + " is " + users[0].attributes.password);
                if (password.localeCompare(users[0].attributes.password) == 0) {
                    console.log("Password is correct");
                    res.status(200).send({status: 'success', response: users[0].attributes}).end();
                } else {
                    res.status(400).send({status: 'failure', reason: 'No user details found for email ' + email});
                }
            }else{
                res.status(400).send({status: 'failure', reason: 'No user details found for email ' + email});
            }
        },function(err){
            console.log("Failed to get details");
            res.status(400).send({status: 'failure', reason: 'No user details found for email ' + email});
        });
    }catch (Error){
        console.log(Error);
        res.status(400).send({status: "failure", reason: "No user details found for email " + email});
    }
};

/** get details for a specific user **/
exports.getUser = function(req,res){
    // get the email from the request parameter
    var email = req.params.email;

    console.log("Email received: "+email);

    var data = req.data;
    var allUsers = data.Query.ofType("User");

    //Find objects with particular name
    allUsers.find({email:email}).done(function(users){
        // verify if the user name exists
        if(users[0]){
            console.log(users[0].attributes);
            res.status(200).send( {status:"success",response:users[0].attributes});

        }else{
            console.log("No user details found for email "+email);
            res.status(400).send( {status:"failure",reason: "No user details found for email "+email});
        }
    },function(err){
        console.log("Failed to get details");
        res.status(400).send({status: "failure", reason: "No user details found for email " + email});
    });

};

/** update the details for a specific user **/
exports.updateUser = function(req,res){

    // get all the user details from the request
    var email = req.params.email;
    var name = req.body.name;
    var password = req.body.password;
    var phoneNumber = req.body.phoneNumber;
    var currentLocation = req.body.currentLocation;
    var vechileRegisterationNumber = req.body.vechileRegisterationNumber;

    console.log(email+" , "+name+" , "+password+" , "+phoneNumber+" , "+currentLocation+" , "+vechileRegisterationNumber);

    var allUser = req.data.Query.ofType("User");

    try {
        allUser.find({email: email}).then(function (users) {
            // return the first value in the response
            console.log(users[0]);
            if (users[0] == undefined) {
                res.status(400).send({status: "failure", reason: "Unable to update details for email " + email});
            } else {
                return req.data.Object.withId(users[0]._meta.objectId)
            }
        }).then(function (userObj) {
            // set the updated values
            userObj.set({
                name: name,
                password: password,
                phoneNumber: phoneNumber,
                currentLocation: currentLocation,
                vechileRegisterationNumber: vechileRegisterationNumber
            });
            // save the details on the back end
            return userObj.save();
        }).then(function (result) {
            console.log("the final updated result is" + result);
            res.status(200).send({status: "success", response: result});
        }, function (err) {
            console.err("An error happened while updating values");
            res.status(500).send({status: "failure", reason: "Unable to update details for email " + email});
        });
    }catch(error){
        console.err("An error happened while updating values");
        res.status(500).send({status: "failure", reason: "Unable to update details for email " + email});
    }
};
