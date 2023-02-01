const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqseuad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const userCollections = client.db('easy-doc').collection('users');
        const userPostCollections = client.db('easy-doc').collection('userPost');
        const blogsCollections = client.db('easy-doc').collection('blogs');
        const tutorialCollections = client.db('easy-doc').collection('tutorial');
        const commentCollections = client.db('easy-doc').collection('comment');
        const menuCollection = client.db('easy-doc').collection('menu');
        const subMenuCollection = client.db('easy-doc').collection('subMenu');

        // when user register he/she will be inserted in userCollection
        // if user already exist nothing changes  happened
        app.put('/user', async (req, res) => {
            const user = req.body;
            const uid = req?.query?.uid;
            const options = { upsert: true };
            const filter = { uid: uid };
            const updateDoc = {
                $set: user
            }
            const result = await userCollections.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        // get single user by query with uid
        app.get('/user', async (req, res) => {
            const uid = req.query.uid;
            const query = { uid: uid };
            const user = await userCollections.findOne(query);
            res.send(user);
        });
        app.get('/users', async (req, res) => {
            const query = {};
            const user = await userCollections.find(query).toArray();
            res.send(user);
        });

        // user post collect
        app.post('/userPost', async (req, res) => {
            const userpost = req.body;
            const result = await userPostCollections.insertOne(userpost)
            console.log(result)
            res.send(result)
        });

        // get user post
        app.get('/allUserPost', async (req, res) => {
            const query = {}
            const result = await userPostCollections.find(query).toArray()
            res.send(result)
        });

        // get blog
        app.get('/blog', async (req, res) => {
            const query = {};
            const result = await blogsCollections.find(query).toArray();
            res.send(result);
        });

        // get blog id
        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollections.findOne(query);
            res.send(result);
        });

        // post comment
        app.post('/comment', async (req, res) => {
            const info = req.body;
            const result = await commentCollections.insertOne(info);
            res.send(result);
        });

        // specif comment
        app.get('/comment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id };
            const result = await commentCollections.find(query).toArray();
            res.send(result);
        });
        app.get('/menu', async (req, res) => {
            const query = {};
            const result = await menuCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/menu/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { menuId: id };
            const result = await subMenuCollection.find(query).toArray();
            res.send(result);
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