const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your TodoList!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

(async function() {
  try {
    await Item.insertMany(defaultItems);
    console.log("Successfully saved  default items to DB.");
  } catch (err) {
    console.log(err);
  }
})();

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({})
  .then((todoItems) => {
    console.log(todoItems);
  })
  .catch((err) => {
    console.log(err);
  });

  res.render("list", {
    listTitle: day,
    listItems: listItems
  });
});

app.get("/work", function(req, res){
  res.render("list", {
    listTitle: "Work List",
    listItems: workItems});
});

app.post("/", function(req, res){

  if(req.body.listSubmit === "Work"){
    workItems.push(req.body.newTodo);
    res.redirect("/work");
  }else{
    listItems.push(req.body.newTodo);
    res.redirect("/");
  }
});

app.listen(3000, function() {
  console.log("Server running on port 3000.");
});