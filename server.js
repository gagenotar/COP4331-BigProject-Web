const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const PORT = process.env.PORT || 5001;

// Middleware setup
const app = express();
app.set('port', PORT);
app.use(cors());
app.use(bodyParser.json());
app.use('/api', tripRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
client.connect().catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// CORS setup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

/* 
Login endpoint 

Request
{
  email: String
  password: String
}
Response
{
  id: _id
  login: String
  firstName: String
  lastName: String
}
*/
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = client.db('journeyJournal');
    const user = await db.collection('user').findOne({ email, password });
    if (user) {
      res.status(200).json({ id: user._id, login: user.login, firstName: user.firstName, lastName: user.lastName });
    } else {
      res.status(404).json({ error: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

/* 
Register endpoint 

Request body
{
  firstName: String
  lastName: String
  email: String
  login: String
  password: String
}

Response
{
  id: new id
  login: username
}
*/
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, login, password } = req.body;
  const newUser = { firstName, lastName, email, login, password };

  try {
    const db = client.db('journeyJournal');
    const result = await db.collection('user').insertOne(newUser);
    res.status(200).json({ id: result.insertedId, login: login });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

/* 
Add entry endpoint 

Request body
{
  userId: _id
  title: String
  description: String
  location: {
    street: String
    city: String
    state: String
    country: String
  }
  rating: Number
}

Response
{
  _id: new id
}
*/
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/addEntry', upload.single('image'), async (req, res) => {
  const { userId, title, description } = req.body;
  const location = JSON.parse(req.body.location); // Parse the location field back into an object
  const rating = parseInt(req.body.rating, 10); // Ensure rating is an integer
  const date = new Date(); // Add the current date

  const newTrip = { 
    userId: new ObjectId(userId), // Convert userId to ObjectId
    title, 
    description, 
    location, 
    rating,
    image: req.file ? req.file.path : null,
    date
  };

  try {
    const db = client.db('journeyJournal');
    const result = await db.collection('journalEntry').insertOne(newTrip);
    res.status(200).json({ _id: result.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// app.use('/uploads', express.static('uploads'));


/* 
Delete entry endpoint 

example DEL URL: http://localhost:5001/api/editEntry/66798781672b94aba8e51609

Request body
{
  N/A
}

Response
simple message
*/
app.delete('/api/deleteEntry/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = client.db('journeyJournal');
    const result = await db.collection('journalEntry').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      res.status(200).send('Entry deleted successfully');
    } else {
      res.status(404).send('Entry not found');
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

/* 
Edit entry endpoint 

example PUT URL: http://localhost:5001/api/editEntry/66798781672b94aba8e51609

Request body
{
  any info to update
}

Response
{
  updated entry
}
*/
// app.put('/api/editEntry/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const db = client.db('journeyJournal');

//     const filter = { _id: new ObjectId(id) };
//     const update = { $set: req.body };

//     const result = await db.collection('journalEntry').findOneAndUpdate(filter, update);
//     if (!result) {
//       return res.status(404).send('Entry not found');
//     }

//     const newResult = await db.collection('journalEntry').findOne({ _id: new ObjectId(id) });

//     res.status(200).json(newResult);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.put('/api/editEntry/:id', upload.single('image'), async (req, res) => {
  try {
      const { id } = req.params;
      const db = client.db('journeyJournal');

      const update = {
          title: req.body.title,
          description: req.body.description,
          location: JSON.parse(req.body.location),
          rating: parseInt(req.body.rating, 10),
      };

      if (req.file) {
          update.image = req.file.path;
      }

      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: update };

      const result = await db.collection('journalEntry').findOneAndUpdate(filter, updateDoc);
      if (!result) {
          return res.status(404).send('Entry not found');
      }

      const newResult = await db.collection('journalEntry').findOne({ _id: new ObjectId(id) });

      res.status(200).json(newResult);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

/* 
Search all entries endpoint 

Request
search: String

Response
results[]
*/
app.post('/api/searchEntries', async (req, res) => {
  const { search, userId } = req.body;

  try {
    const db = client.db('journeyJournal');
    const query = { 
      ...(search ? { title: { $regex: search, $options: 'i' } } : {}), ...(userId ? { userId: new ObjectId(userId) } : {}) };
    const results = await db.collection('journalEntry').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'user',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          location: 1,
          image: 1,
          date: 1,
          rating: 1,
          username: '$userDetails.login',
          userPicture: '$userDetails.pfp'
        }
      },
      { $sort: { date: -1 } } // Sort by date in descending order
    ]).toArray();
    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

/* 
Search entries for a specific userId endpoint 

Request
{
  search: String
  userId: _id
}


Response
results[]
*/
app.post('/api/searchMyEntries', async (req, res) => {
  const { search, userId } = req.body;

  try {
    const db = client.db('journeyJournal');
    const query = { 
      userId: new ObjectId(userId),
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.street': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } }
      ]
    };

    const results = await db.collection('journalEntry').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'user',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          location: 1,
          image: 1,
          date: 1,
          rating: 1,
          username: '$userDetails.login',
          userPicture: '$userDetails.pfp'
        }
      },
      { $sort: { date: -1 } } // Sort by date in descending order
    ]).toArray();

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});


/* 
Get entry by ID endpoint 

Request
{id: entryId}

Response
{entry}
*/
app.get('/api/getEntry/:id', async (req, res) => {
  try {
    console.log(`Received request for trip with id: ${req.params.id}`);
    const db = client.db('journeyJournal');
    
    // Fetch entry, user, 
    const entry = await db.collection('journalEntry').findOne({ _id: new ObjectId(req.params.id) });
    console.log('Fetched entry:', entry); // Log the fetched entry

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Fetch the user
    const user = await db.collection('user').findOne({ _id: new ObjectId(entry.userId) });
    console.log('Fetched user:', user); // Log the fetched user

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine the entry with the username and send the response
    const response = { ...entry, username: user.login }; // 'login' field in the user collection
    console.log('Response:', response); // Log the response
    res.status(200).json(response);
  } catch (e) {
    console.error('Error:', e.toString()); // Log any errors
    res.status(500).json({ error: e.toString() });
  }
});

// Serve static files from the 'frontend/build' directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  // Wildcard route to serve index.html for all non-API requests
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});