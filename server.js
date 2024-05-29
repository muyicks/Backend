//import dependencies modules:
const express = require("express");
// const bodyParser = require('body-parser')

// Create an Express.js instance:
const app = express();

// config Express.js
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

// connect to MongoDB
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://muyicks:Muyicks%401@cluster0.bjexpwj.mongodb.net/",
  (err, client) => {
    db = client.db("webstore");
  }
);

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

// retrieve all the object from an collection
app.get("/collection/:collectionName", (req, res, next) => {
  db.collection(req.params.collectionName)
    .find({})
    .toArray((e, results) => {
      if (e) return next(e);
      res.send(results);
    });
});

app.post("/search/collection/:collectionName/", (req, res, next) => {
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

  db.collection(req.params.collectionName)
    .find(search)
    .sort({ [sort]: order })
    .toArray((e, results) => {
      if (e) return next(e);
      res.send(results);
    });
});

//to insert a document to the collection
app.post("/collection/:collectionName", (req, res, next) => {
  db.collection(req.params.collectionName).insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
});

//to retrieve a particular document by ID
const ObjectID = require("mongodb").ObjectID;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  db.collection(req.params.collectionName).findOne(
    { _id: new ObjectID(req.params.id) },
    (e, result) => {
      if (e) return next(e);
      res.send(result);
    }
  );
});

//to update a document by ID
app.put("/collection/:collectionName/:id", (req, res, next) => {
  db.collection(req.params.collectionName).update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
  db.collection(req.params.collectionName).deleteOne(
    { _id: ObjectID(req.params.id) },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});

app.listen(8000, () => {
  console.log("Express.js server running at localhost:3000");
});