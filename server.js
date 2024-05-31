const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

// config Express.js
app.use(express.json());
app.use(cors());

// Connecting to the database
var db;
const uri = "mongodb+srv://muyicks:Muyicks%401@cluster0.bjexpwj.mongodb.net/";
try {
  const client = new MongoClient(uri);
  db = client.db("webstore");
  console.log("Successfully connected to MongoDB!");
} catch (e) {
  console.error("Database connection failed. - Error:" + e);
}

// Logger Middleware
app.use((req, res, next) => {
  var log = `${req.ip} -- ${req.method} ${req.path} ${res.statusCode}"`;
  console.log(log, req.body);
  next();
});

app.get("/", (req, res) => {
  // db.collection('lessons').updateMany({}, { $set: { avaliability: 5 } });
  res.send("Select a collection, e.g., /collection/lessons");
});

// retrieve all the object from an collection
app.get("/collection/:collectionName", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .find({})
      .toArray()
      .then((results) => {
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
});

// Search
app.post("/search/collection/lessons/", (req, res) => {
  try {
    var search = req.body.search;
    var sort = req.body.sort || "title";
    var order = req.body.order == "desc" ? -1 : 1;

    if (search) {
      search = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      search = {};
    }

    db.collection("lessons")
      .find(search)
      .sort({ [sort]: order })
      .toArray()
      .then((results) => {
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
});

//to insert a document to the collection
app.post("/collection/:collectionName", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .insertOne(req.body)
      .then((results) => {
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
});

app.get("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((results) => {
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
});

//to update a document by ID
app.put("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
      .then((results) => {
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((results) => {
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("Express.js server running at PORT 3000");
});