const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        const usersCollection = client.db('educateDb').collection('users');
        const classCollection = client.db('educateDb').collection('class');
        const selectedCollection = client.db('educateDb').collection('selecteds');

        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, env.process.PAYMENT_SECRET_KEY, {
                expiresIn: '1h'
            })
            res.send({ token })
        })

        //users apis
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: "user already exist" })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        });

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result);
        })
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result);
        })

        // class apis
        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })

        // selected collection apis
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

        app.delete('/selecteds/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await selectedCollection.deleteOne(query)
            res.send(result)
        })

        // create payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_type: [card]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
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