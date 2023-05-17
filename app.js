//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const { name } = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ajay_03:ajay@cluster0.dtjid1z.mongodb.net/toDoList",{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=> console.log("Server connected")).catch(err => console.log(err));

const listSchema = {
  name: String
}

const Item = mongoose.model('Item',listSchema);

const item1 = new Item({
  name: 'Welcome to toDoList'
});

const item2 = new Item({
  name: 'Press + to add a new Item'
});

const item3 = new Item({
  name: '<-- press this to remove item'
});

//list schema and creating model of custom list
const List = mongoose.model('List',{name: String, items: [listSchema]});

app.get("/", function(req, res) {

const day = date.getDate();

  
  Item.find().then(items =>{
    if(items.length==0){
      Item.insertMany([item1, item2, item3])
      .then(()=> console.log('Inserted succussfully'))
      .catch(err => console.log('Error in Inserction'));
    }
    else{
      console.log('DB is not empty');
      res.render("list", {listTitle: day, newListItems: items, forPost: "", fordelete: ""});
    }
  })

});

app.post("/insert/", function(req, res){

  const newItem = new Item({
    name: req.body.newItem
  });

  newItem.save();

  res.redirect('/');


  /*const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }*/
});

app.post("/delete/",function(req,res){
  var del = req.body.check;
  Item.findByIdAndRemove(del).then(()=>{
    console.log('Deleted');
    res.redirect("/");
  })
  .catch(err => res.send('Error in deletion root dir'));
});

//Get method of customList
app.get('/:customListName',function(req,res){
  const customListName = req.params.customListName;

  var NList = new List({
    name: customListName,
    items: [item1,item2,item3]
  });

  List.findOne({name: customListName})
  .then(nam => {
    if(nam){
      res.render("list", {listTitle: nam.name, newListItems: nam.items, forPost: customListName, fordelete: customListName});
    }else{
      NList.save();
      res.redirect('/'+customListName);
    }
  })
  .catch(err => res.send('<h1>Error Occured</h1>\n'+err));
});

app.post('/insert/:customListName',function(req,res){
  const newItem = new Item({
    name: req.body.newItem
  });
  List.findOne({name: req.params.customListName})
  .then(exLis => {
    exLis.items.push(newItem);
    exLis.save();
    console.log('Inserted');
    res.redirect('/'+req.params.customListName);
  })
  .catch(err => console.log(err));
  
});
app.post('/delete/:customListName',function(req,res){
  var cusNam = req.params.customListName;
  List.findOneAndUpdate({name: cusNam},{$pull: {items: {_id: req.body.check}}})
  .then(()=>{
    console.log('Custom Del Succs');
    res.redirect('/'+cusNam);
  })
  .catch(err => console.log('Error in Cus Del'));
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
