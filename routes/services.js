/**
 * Created by meshriva on 11/21/2014.
 */
var express = require('express');

exports.getServiceInfo = function(req,res){
    if (!req.isAuthenticated()){
        console.log('login first');
        res.redirect('/signin');
    }else{
        console.log('The user info in getServiceInfo method is '+req.user.email);
        res.render('services', { title: 'Services',user:req.user,msg : {} });
    }


}
