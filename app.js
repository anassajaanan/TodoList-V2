const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const _ = require('lodash');
require('dotenv').config();
const date = require(__dirname + '/public/js/date.js');


const app = express();
const port = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));


mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});


mongoose.connection.on('connected', () => {
    console.log('Connected to database');
});

const itemsSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const Item = mongoose.model('Item', itemsSchema);

const List = mongoose.model('List', listSchema);


app.get('/', (req, res) => {
    const currentDate = date.getDate();
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {title: currentDate, listItems: foundItems, action: '/'});
        }
    });

});


app.post('/', (req, res) => {
    const newTodoList = req.body.todo;
    const newItem = new Item({
        name: newTodoList
    });
    newItem.save().then((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully added new item to DB");
        }
    });
    res.redirect('/');
});

app.get('/:customListName', (req, res) => {
    const customListName = _.startCase(_.toLower(req.params.customListName));
    List.find({name: customListName}, function (err, foundList) {
        if (err) {
            console.log(err);
        }
        if (foundList.length === 0) {
            const newList = new List({
                name: customListName,
                items: []
            });
            newList.save();
            res.redirect("/" + customListName);
        } else {
            res.render('index', {
                title: foundList[0].name,
                listItems: foundList[0].items,
                action: '/' + customListName
            });
        }
    });
});

app.post("/:customListName", (req, res) => {
    const newTodoList = req.body.todo;
    const customListName = _.startCase(_.toLower(req.params.customListName));
    List.updateOne({name: customListName}, {$push: {items: {name: newTodoList}}}, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/" + customListName);
        }
    });
});


app.post("/delete/item", (req, res) => {
    const checkedItemId = req.body.clickedItemId;
    const title = req.body.title;
    const currentDate = date.getDate();
    if (title === currentDate) {
        Item.deleteOne({_id: checkedItemId}, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted checked item from Items");
            }
        });
        res.redirect('/');
    } else {
        List.updateOne({name: title}, {$pull: {items: {_id: checkedItemId}}}, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/" + title);
            }
        });
    }

});

app.listen(port, () => {
    console.log("Listening on port " + port);
});

