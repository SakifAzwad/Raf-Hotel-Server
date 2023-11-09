const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use();
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

const logger = (req, res, next) =>{
    console.log('log: info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) =>{
    const token = req?.cookies?.token;
    // console.log('token in the middleware', token);
    // no token available 
    if(!token){
        return res.status(401).send({message: 'unauthorized access'})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err){
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.user = decoded;
        next();
    })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const rafhotelCol = client.db("raf-hotel").collection("rooms");
    const rafhotelCol2 = client.db("raf-hotel").collection("bookings");
    const rafhotelCol3 = client.db("raf-hotel").collection("reviews");


    app.post('/jwt', logger, async (req, res) => {
        const user = req.body;
        console.log('user for token', user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
            .send({ success: true });
    })

    app.post('/logout', async (req, res) => {
        const user = req.body;
        console.log('logging out', user);
        res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

    app.get("/rooms", async (req, res) => {
      const cursor = rafhotelCol.find();
      const rest = await cursor.toArray();
      res.send(rest);
    });
    app.get("/reviews", async (req, res) => {
      const cursor = rafhotelCol3.find();
      const rest = await cursor.toArray();
      res.send(rest);
    });

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await rafhotelCol.findOne(query);
      res.send(result);
    });
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await rafhotelCol2.findOne(query);
      res.send(result);
    });
    app.put('/update/:id',async(req,res)=>
    {
     const id=req.params.id;
     const filter={_id: new ObjectId(id)};
     const options = {upsert : true};
     const update=req.body;
     const pro = 
     {
       $set:
       {
         bookingDate:update.bookingDate
       }
     }
     const result=await rafhotelCol2.updateOne(filter,pro,options);
       res.send(result);
    })
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
    
    app.put('/bookings/:id',async(req,res)=>
     {
      const id=req.params.id;
      const filter={_id: new ObjectId(id)};
      const options = {upsert : true};
      const update=req.body;
      const pro = 
      {
        $set:
        {
          bookingDate:update.bookingDate
        }
      }
      const result=await rafhotelCol2.updateOne(filter,pro,options);
        res.send(result);
     })

    app.get("/bookings", async (req, res) => {
      const cursor = rafhotelCol2.find();
      const rest = await cursor.toArray();
      res.send(rest);
    });
    app.get('/bookings/:id',async(req,res)=>
     {
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const result=await rafhotelCol2.findOne(query);
        res.send(result);
     })

     app.delete('/bookings/:id',async(req,res)=>
     {
       const id=req.params.id;
       const query={_id: new ObjectId(id)};
       const rest=await rafhotelCol2.deleteOne(query);
       res.send(rest);
     })

    app.post("/bookings", async (req, res) => {
      const ne = req.body;
      const result = await rafhotelCol2.insertOne(ne);
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const ne = req.body;
      const result = await rafhotelCol3.insertOne(ne);
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
