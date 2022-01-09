//jshint esversion:6
////into the folder, and type nodemon app.js to start
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const _ = require("lodash"); /// To use existing functions

const mongoose = require("mongoose"); ///use the MongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true})///create the database todolist

const itemSchema = { ///create new table in the schema, and set the format of table
  name:String
};

const Item=mongoose.model("Item",itemSchema); ///fit the dataset into table

const item1 = new Item({  ///store value to the dataset,not insert yet
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = { //create a new dataset in the schema
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List",listSchema);

//get date
const today = new Date()
const currentDay=today.getDay();
const options = {//weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
};
const date = today.toLocaleDateString("en-US",options);
var day = "";
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

/// check whether we are in the first page
app.get("/", function(req,res){
  Item.find({},function(err,foundItems) { /// = select *
    if (foundItems.length===0) {
      Item.insertMany(defaultItems, function(err){   ///start to ingest the stored value
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB."); /// standard query to check the ingesting status
        }
      });
      res.redirect("/");
    } else {
      ///res.render("list", {listTitle: "Today", newListItems: foundItems}); ///use render to pass data into list EJS file
      /// if already have to do thing, return previous value
      res.render("list",{listTitle: "Today", newListItems: foundItems,kindOfDay : day, ExactDate : date});///use render to pass data into list EJS file
    }
  });
});

//function: type the work list name(ignore capitalize), direct to corresponding list
app.get ("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function(err,foundList){ //select
    if (!err){
      if(!foundList) {   /// if no foundlist
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems //the item123
        });
        list.save();
        res.redirect("/"+ customListName);
      } else { //Show an existing list-foundlisr(arary)
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items,kindOfDay : day, ExactDate : date});
    }
  }
});

});

var items=["Work"];
var item="";




app.post("/",function(req,res) {
  const itemName = req.body.newItem; //get the input from EJS checkbox
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){  //"Today" is the homepage name
    item.save(); //save to the DB
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName); //stay at the same page, not direct to homepage
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox; //the deleting id
  const listName = req.body.listName; //the deleting list page
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (!err) {  //standard status check
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {  ///Item list is for homepage, List is for other pages
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
  }
});
}

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
