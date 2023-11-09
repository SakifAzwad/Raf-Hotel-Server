const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gp9ypzc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const rafhotelCol = client.db("raf-hotel").collection("rooms");
    const rafhotelCol2 = client.db("raf-hotel").collection("bookings");

    app.get("/rooms", async (req, res) => {
      const cursor = rafhotelCol.find();
      const rest = await cursor.toArray();
      res.send(rest);
    });

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await rafhotelCol.findOne(query);
      res.send(result);
    });

    app.put('/rooms/:id',async(req,res)=>
     {
      const id=req.params.id;
      const filter={_id: new ObjectId(id)};
      const options = {upsert : true};
      const update=req.body;
      const pro = 
      {
        $set:
        {
          availability:update.availability
        }
      }
      const result=await rafhotelCol.updateOne(filter,pro,options);
        res.send(result);
     })

    app.get("/bookings", async (req, res) => {
      const cursor = rafhotelCol2.find();
      const rest = await cursor.toArray();
      res.send(rest);
    });

    app.post("/bookings", async (req, res) => {
      const ne = req.body;
      const result = await rafhotelCol2.insertOne(ne);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`Coffee server is running on port:${port}`);
});
