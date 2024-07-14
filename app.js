const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your TodoList!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

const day = date.getDate();

app.get("/", async (req, res) => {

  try {
    const todoItems = await Item.find({});
    if (todoItems.length === 0) {
      await Item.insertMany(defaultItems);
      res.redirect("/");
    } else{
      res.render("list", {
        listTitle: day,
        listItems: todoItems,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    try {
      // We can use Item.deleteOne method also
      await Item.findByIdAndDelete({_id: checkedItemId});
      console.log("Item deleted!");
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } else{
    try {
      await List.findOneAndUpdate(
        {name: listName},
        {$pull: {items: {_id: checkedItemId}}}
      );
      console.log("Item deleted from custom list!");
      res.redirect(`/${listName}`);
    } catch (err) {
      console.log(err);
    }
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({name: customListName});
    if(!foundList){
      // console.log("Doesn't exist!");
      // Create a new list
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect(`/${customListName}`);
    } else{
      // console.log("Exists!");
      // Show an existing list
      res.render("list", {listTitle: foundList.name, listItems: foundList.items,});
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/", async (req, res) => {
  const itemName = req.body.newTodo;
  const listName = req.body.listSubmit;

  const item = new Item({
    name: itemName,
  });

  console.log(listName);

  try {
    if(listName === day){
      await item.save();
      res.redirect("/");
    } else{
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      await foundList.save();
      res.redirect(`/${listName}`);
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, function () {
  console.log("Server running on port 3000.");
});
