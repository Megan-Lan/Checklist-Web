//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var items=["Work"];
var item="";

app.get("/", function(req, res){
  var today = new Date();
  var currentDay = today.getDay();
  var day = "";
  var options = {
    //weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  var date = today.toLocaleDateString("en-US",options);


  switch (currentDay) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
        day = "Tuesday";
        break;
    case 3:
        day = "Wednesday";
        break;
    case 4:
        day = "Thursday";
        break;
    case 5:
        day = "Friday";
        break;
    default:
      day="Saturday";
  }
  console.log(item);
  res.render("list",{ kindOfDay : day, ExactDate : date, Newlistitem : items});

});

app.post("/",function(req,res) {
  item=req.body.NewItem;
  items.push(item);
  res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started on port 3000.");
});
