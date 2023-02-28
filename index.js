const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
//payment srtipe key
const stripe = require("stripe")(
    "sk_test_51MXOWSGYEoGN3ZPinOJgpoPOrKNm01m4zqXdFFoCl3KFDL7Y8xrJdOKbYFb3ANEyBkHUkWQHbkpfqO5d1w0IPw3w00eOxlapZk"
);

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqseuad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// verifying that user has token or not
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'you have no token so we can not give access' })
    }
    const userToken = authHeader.split(' ')[1];
    jwt.verify(userToken, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'token is not valid or you lost your token' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const userCollections = client.db("easy-doc").collection("users");
        const userPostCollections = client.db("easy-doc").collection("userPost");
        const blogsCollections = client.db("easy-doc").collection("blogs");
        const commentCollections = client.db("easy-doc").collection("comment");
        const docCollection = client.db("easy-doc").collection("documentation");
        const userCommentCollections = client
            .db("easy-doc")
            .collection("userComment");
        const paymentCollectionSubscription = client
            .db("easy-doc")
            .collection("subscriptionPayment");
        const allcourses = client.db("easy-doc").collection("courses");
        const quizCollection = client.db("easy-doc").collection("quiz");
        const feedbackCollection = client.db("easy-doc").collection("feedback");

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollections.findOne(query);
            if (user) {
                const token = jwt.sign({ user }, process.env.ACCESS_TOKEN, { expiresIn: '2d' });
                return res.send({ accessToken: token })
            }
            else {
                return res.status(403).send({ accessToken: '' })
            }

        })
        // quiz
        app.get("/quiz", async (req, res) => {
            const quiz = {};
            const result = await quizCollection.find(quiz).toArray();
            res.send(result);
        });

        // single quiz
        app.get("/quiz/:id", async (req, res) => {
            const id = req.params.id;
            const query = { id };
            const result = await quizCollection.findOne(query);
            res.send(result);
        });

        // post feedback
        app.post('/feedback', async (req, res) => {
            const userFeedback = req.body;
            const result = await feedbackCollection.insertOne(userFeedback);
            res.send(result);
        });

        // get feedback
        app.get('/feedback', async (req, res) => {
            const feedback = {};
            const result = await feedbackCollection.find(feedback).toArray();
            res.send(result);
        })

        //payment route with stripe initail route
        app.post("/create-payment-intent", async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                payment_method_types: ["card"],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        //collect payment info
        app.post("/payments", async (req, res) => {
            const payment = req.body;
            const result = await paymentCollectionSubscription.insertOne(payment);
            res.send(result);
        });

        // payment user delete
        app.delete('/paymentUsers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await paymentCollectionSubscription.deleteOne(query);
            res.send(result);
        })

        // all payment users
        app.get('/paymentUsers', async (req, res) => {
            const paymentUser = {};
            const result = await paymentCollectionSubscription.find(paymentUser).toArray();
            res.send(result);
        })

        // when user register he/she will be inserted in userCollection
        // if user already exist nothing changes  happened
        app.put("/user", async (req, res) => {
            const user = req.body;
            const email = req?.query?.email;
            const options = { upsert: true };
            const filter = { email: email };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollections.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        //all courses route for all courses
        app.get("/allcourses", async (req, res) => {
            const query = {};
            const allcours = await allcourses.find(query).toArray();
            res.send(allcours);
        });
        //courses details for single course
        app.get("/coursesDetails/:id", async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await allcourses.findOne(query);
            res.send(result);
        })
        // get single user by query with uid
        app.get("/user", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollections.findOne(query);
            res.send(user);
        });
        // get all user
        app.get("/allUser", async (req, res) => {
            const user = {};
            const result = await userCollections.find(user).toArray();
            res.send(result);
        });

        // user post collect
        app.post("/userPost", async (req, res) => {
            const userpost = req.body;
            const result = await userPostCollections.insertOne(userpost);
            res.send(result);
        });

        // admin role
        app.get("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollections.findOne(query);
            res.send({ isAdmin: user?.role === "admin" });
        });

        // user delete
        app.delete("/allUser/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollections.deleteOne(query);
            res.send(result);
        });

        // get user post
        app.get("/allUserPost", async (req, res) => {
            const query = {};
            const result = await userPostCollections.find(query).toArray();
            res.send(result);
        });

        // get blog
        app.get("/blog", async (req, res) => {
            const query = {};
            const result = await blogsCollections.find(query).toArray();
            res.send(result);
        });

        // get blog id
        app.get("/blog/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollections.findOne(query);
            res.send(result);
        });

        // blog post
        app.post("/blog", async (req, res) => {
            const blog = req.body;
            const result = await blogsCollections.insertOne(blog);
            res.send(result);
        });

        // post comment
        app.post("/comment", async (req, res) => {
            const info = req.body;
            const result = await commentCollections.insertOne(info);
            res.send(result);
        });

        // specif comment
        app.get("/comment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { id };
            const result = await commentCollections.find(query).toArray();
            res.send(result);
        });
        // here all doc data comes
        app.get("/doc-data", async (req, res) => {
            const result = await docCollection
                .find({})
                .project({ title: 1, id: 1, category: 1 })
                .toArray();
            res.send(result);
        });

        app.get("/interview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await docCollection.findOne(query);
            res.send(result);
        });
        app.get("/error/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await docCollection.findOne(query);
            res.send(result);
        });
        app.get("/installation/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await docCollection.findOne(query);
            res.send(result);
        });
        app.get("/hooks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await docCollection.findOne(query);
            res.send(result);
        });
        app.get("/apireference/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await docCollection.findOne(query);
            res.send(result);
        });

        app.get("/main-concept/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await docCollection.findOne(query);
            res.send(result);
        });

        //store user comment for community route
        app.post("/userComment", async (req, res) => {
            const userComment = req.body;
            const result = await userCommentCollections.insertOne(userComment);
            res.send(result);
        });
        //get user comment for community route
        app.get("/allUserComment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { postId: id };
            const result = await userCommentCollections.find(query).toArray();
            res.send(result);
        });
        app.get("/allUserComment", async (req, res) => {
            const query = {};
            const result = await userCommentCollections.find(query).toArray();
            res.send(result);
        });
    }
    finally {
    }
}
run().catch((error) => console.error(error));

app.get("/", async (req, res) => {
    res.send("Easy doc server running");
});
app.listen(port, async (req, res) => {
    console.log(`server is running on ${port}`);
});
