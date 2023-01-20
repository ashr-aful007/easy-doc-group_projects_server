const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqseuad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
<<<<<<< HEAD
    try{
        
        const usersCollections = client.db('easy-doc').collection('users');
        const tutorialCollections = client.db('easy-doc').collection('tutorial');
        const categoriesCollections = client.db('easy-doc').collection('categories');
        
        // insert users with email password
        app.post('/users', async(req, res) =>{
=======
    try {

        const userCollections = client.db('easy-doc').collection('users');
        const userPostCollections = client.db('easy-doc').collection('userPost');

        // when user register he/she will be inserted in userCollection
        // if user already exist nothing changes  happened
        app.put('/user', async (req, res) => {
>>>>>>> main
            const user = req.body;
            const uid = req?.query?.uid;
            console.log(uid);
            const options = { upsert: true };
            const filter = { uid: uid };
            const updateDoc = {
                $set: user
            }
            const result = await userCollections.updateOne(filter, updateDoc, options);
            res.send(result);
<<<<<<< HEAD
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
=======
        })
        app.get('/user', async (req, res) => {
            const query = {};
            const users = await userCollections.find(query).toArray();
            res.send(users);
        })
        app.post('/userPost', async(req,res) =>{
            const userpost = req.body;
            const result = await userPostCollections.insertOne(userpost)
            console.log(result)
            res.send(result)
        })
        app.get('/allUserPost', async(req,res) =>{
            const query = {}
            const result = await userPostCollections.find(query).toArray()
            res.send(result)
>>>>>>> main
        })

    }
    finally {

    }
}
run().catch(error => console.error(error))


app.get('/', async (req, res) => {
    res.send('Easy doc server running');
})
app.listen(port, async (req, res) => {
    console.log(`server is running on ${port}`);
})