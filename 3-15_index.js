const express = require('express')
const app = express()
const cors = require("cors")
const http = require("http")
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
mongoose.set('strictQuery',false)

const allowedOrigins = ["http://localhost:5173","https://back-end-general-project.fly.dev","http://localhost:3001"]

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET","POST","OPTIONS","DELETE","PUT"],
  credentials: true
}

app.use(express.static('dist'))
app.use(express.json())

const numberSchema = new mongoose.Schema({
    name: String,
    number: String
})

numberSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

const Number = mongoose.model('Number', numberSchema)

app.get('/hello', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/persons',cors(corsOptions), async (request, response) => {
  try{
    await mongoose.connect(url, {
      family: 4,
      serverSelectionTimeoutMS: 30000
    })
    console.log("Connected to Database");
  }catch(err) {
    alert('Failed to connect to Database storage. Error handle:' + err.reason)
  }
  Number.find({}).then(async phonebook => {
  await mongoose.connection.close()
  response.json(phonebook)
  })
})

app.get('/info',cors(corsOptions), async (request,response) => {
    try{
      await mongoose.connect(url, {
        family: 4,
        serverSelectionTimeoutMS: 30000
      })
      console.log("Connected to Database");
    }catch(err) {
      alert('Failed to connect to Database storage. Error handle:' + err.reason)
    }
    Number.find({}).then(async phonebook => {
    await mongoose.connection.close()
    response.send(
        `<p>Phonbook has ${phonebook.length} people<br/>
        ${new Date()}</p>`)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Phonenumber.findById(id)
    .then(person => { 
        response.json(person)
    }) 
    .catch((error) => {
        response.status(400).end()
    })
})

app.options('/persons',cors(corsOptions), (request,response) => {
  response.json(corsOptions)
})

app.options('/persons/:id', cors(corsOptions), (request,response) => {
  response.json(corsOptions)
})

app.options('/info', cors(corsOptions), (request,response) => {
  response.json(corsOptions)
})

app.delete('/persons/:id',cors(corsOptions), async (request, response) => {
  const id = request.params.id
  try{
    await mongoose.connect(url, {
      family: 4,
      serverSelectionTimeoutMS: 30000
    })
    console.log("Connected to Database");
  }catch(err) {
    alert('Failed to connect to Database storage. Error handle:' + err.reason)
  }
  Number.findByIdAndDelete(id)
  .then(async person => {
    await mongoose.connection.close()
    console.log(`Sucsessfuly deleted ${person.name}'s number.`)
    response.status(200).end()
  })
  .catch(async err => {
    await mongoose.connection.close()
    console.log(`Failed to delete with error ${err.message}.`)
    response.status(404).end()
  })
})

app.put('/api/persons/:id', (request,response, next) => {
    const id = request.params.id
    Phonenumber.findByIdAndUpdate(id)
    .then(result => { response.status(204).end()} )
    .catch(error => next(error))
})

app.post('/persons', cors(corsOptions), async (request, response) => {
  const body = request.body
  try{
    await mongoose.connect(url, {
      family: 4,
      serverSelectionTimeoutMS: 30000
    })
    console.log("Connected to Database");
  }catch(err) {
    alert('Failed to connect to Database storage. Error handle:' + err.reason)
  }
  if (!body.name || !body.number) {
      return response.status(400).json({ 
          error: 'required content is missing' 
      })
  }
  const person = new Number({
      name: body.name,
      number: body.number
  })
    
  person.save().then(async result => {
  console.log(`Added ${result.name} with number ${result.number} to phonebook.`)
  await mongoose.connection.close()
  return response.json(person)})
})

const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
