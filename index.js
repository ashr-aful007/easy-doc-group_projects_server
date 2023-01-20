const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqseuad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        
        const usersCollections = client.db('easy-doc').collection('users');
        const tutorialCollections = client.db('easy-doc').collection('tutorial');
        const categoriesCollections = client.db('easy-doc').collection('categories');
        
        // insert users with email password
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);
        });

        // insert google sign up
        app.put('/users', async(req, res) =>{
            const user = req.body;
            const filter = await usersCollections.findOne(user);
            if(!filter){
                const result = await usersCollections.insertOne(user);
                res.send(result);
            }
            else{
                return;
            }
        });

        // insert github sign up
        app.put('/users', async(req, res) =>{
            const user = req.body;
            const filter = await usersCollections.findOne(user);
            if(!filter){
                const result = await usersCollections.insertOne(user);
                res.send(result);
            }
            else{
                return;
            }
        });

        // get tutorial
        app.get('/tutorial', async(req, res) =>{
            const query = {};
            const result = await tutorialCollections.find(query).toArray();
            res.send(result);
        });

        // get categories
        app.get('/categories', async(req, res) =>{
            const query = {};
            const result = await categoriesCollections.find(query).toArray();
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(error => console.error(error))


app.get('/', async(req, res) =>{
    res.send('port is running');
})
app.listen(port, async(req, res) =>{
    console.log(`port is running ${port}`);
})