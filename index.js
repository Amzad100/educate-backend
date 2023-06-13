const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.73bu6ml.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const classCollection = client.db('educateDb').collection('class');
        const selectedCollection = client.db('educateDb').collection('selecteds');

        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })

        // selected collection
        app.get('/selecteds', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { email: email }
            const result = await selectedCollection.find(query).toArray()
            res.send(result);
        })

        app.post('/selecteds', async (req, res) => {
            const item = req.body;
            const result = await selectedCollection.insertOne(item)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('educate is running')
})

app.listen(port, () => {
    console.log(`Educate is running in port ${port}`)
}) 