"use strict";var express=require("express"),pg=require("pg"),app=express(),path=require("path"),clientBuildDir=__dirname+"/../../client/app/";app.set("port",process.env.PORT||5e3),app.use(express.static(clientBuildDir)),app.set("view engine","ejs"),app.get("/",function(e,r){r.sendFile(path.join(clientBuildDir+"/index.html"))}),app.get("/Donor",function(e,r){}),app.get("/times",function(e,r){for(var p="",n=process.env.TIMES||5,t=0;t<n;t++)p+=t+" ";r.send(p)}),app.get("/db",function(e,r){pg.connect(process.env.DATABASE_URL,function(e,p,n){if(e)return console.error(e),void r.send("Error "+e);p.query("SELECT * FROM test_table;",function(e,p){n(),e?(console.error(e),r.send("Error "+e)):r.render("pages/db",{results:p.rows})})})}),app.listen(app.get("port"),function(){console.log("Node app is running on port",app.get("port"))});
//# sourceMappingURL=server.js.map
