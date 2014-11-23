/**
 * Created by meshriva on 11/12/2014.
 */

var express = require('express');

/** Delete a Circle with an objectId  and its mapping**/
exports.delete =function(req,res){

    // get the variables from request
    var trustId = req.params.trustId;

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circleUsers = data.Query.ofType("CircleUsers");

    data.Object.withId(trustId)
        .then(function(obj){
            obj.del();
        }).then(function(){
            circleUsers.find({trustId:trustId}).then(function(circleUserMappings){

                // log the response received
                console.log(circleUserMappings);

                //  check if the response is not having the mapping result
                if(circleUserMappings ==undefined || circleUserMappings[0]== undefined || circleUserMappings[0].attributes==undefined){
                    res.status(400).send({status: "failure", reason:"unable to get the circle mapping for"+user});
                }else{
                    circleUserMappings.forEach(function(circleuser){
                        circleuser.del();
                    });
                    res.status(200).send({status: "success", reason:"All Circle mapping delete"});
                }

            },function(error){
                res.status(500).send({status: "failure", reason:err});
            })
        });
}

/** create a new circle **/
exports.create = function(req,res){

    // get the variables from request
    var name = req.body.name;
    var desc = req.body.desc;
    var admin = req.body.admin;
    var location =req.body.location;
    var open = req.body.open;
    var active =req.body.active ;

    console.log(name+" , "+desc+" , "+admin+" , "+location+" , "+open+" , "+active);

    // get the IBM data from request
    var data = req.data;

    //Create a circle object
    var circle = data.Object.ofType("Circles",{
        "name":name,
        "desc":desc,
        "admin":admin,
        "location":location,
        "open":open,
        "active":active
    });

    //Create a CircleUser object
    var circleUser = data.Object.ofType("CircleUsers",{
        "user":admin,
        "circle_name":name,
        "circle_desc":desc,
        "circle_admin":admin,
        "circle_open":open,
        "circle_active":active,
        "circle_location":location
    });

    circle.save().then(function(savedCircle){
        // print the response form back end server
        console.log(savedCircle);

        //check if the response has some value
        if(savedCircle==undefined ||savedCircle._meta==undefined){
            res.status(500).send({status: "failure", reason:"Unable to store the circle"});
        }else {
            return savedCircle._meta.objectId;
        }

    }).then(function (objectId) {

        if(objectId==undefined){
            res.status(500).send({status: "failure", reason:"Unable to store the circle"})
        }else{
            // print the object received
            console.log(objectId);
            circleUser.set("trustId",objectId);
            return circleUser.save();
        }

    }).then(function(response){

        // print the response form back end server
        console.log(response);

        if(response==undefined || response._meta.objectId==undefined){
            res.status(500).send({status: "failure", reason:"Unable to store the user circle mapping"});
        }else{
            res.status(200).send({status: "success", reason:response});
        }

    }, function (err) {
        res.status(500).send({status: "failure", reason:err});
    });

}

exports.findCircles = function(req,res){

    // get the condition from request
    var condition = {};

    var admin = req.body.admin;
    var location = req.body.location;
    var open = req.body.open;

    if(admin!=undefined){
        condition.admin = admin;
    }

    if(location!=undefined){
        condition.location = location;
    }

    if(open!=undefined){
        condition.open = open;
    }

    //display the conditions
    console.log(condition);

    // get the IBM data from request
    var data = req.data;

    //Find objects for Circle Users mapping
    var circles = data.Query.ofType("Circles");

    circles.find(condition).then(function(circles){

        // log the response received
        console.log(circles);

        //  check if the response is not having the mapping result
        if(circles ==undefined || circles[0]== undefined || circles[0].attributes==undefined){
            res.status(400).send({status: "failure", reason:"unable to get the circle mapping for "+condition});
        }else{
            res.status(200).send({status: "success", reason:circles});
        }

    },function(error){
        res.status(500).send({status: "failure", reason:err});
    });

}
