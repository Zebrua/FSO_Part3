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

const ErrorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === "ValidationError") {
    return response.status(400).json({error: error.message})
  }else if (error.name === "CastError") {
    return response.status(400).send({error: "malformated id"})
  }
}

const numberSchema = new mongoose.Schema({
    name: {
      type: String,
      minlength: 3,
      required: true
    },
    number: {
      type: String,
      validate: {
        validator: function(v) {
          return /\d{3}-\d{7}/.test(v)
        }
      },
      required: true
    }
})

numberSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

const Number = mongoose.model('Number', numberSchema)

app.get('/', (request, response) => {
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

app.get('/persons/:id', cors(corsOptions), async (request,response) => {
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
  Number.findByID(id)
  .then(async person =>{
    await mongoose.connection.close()
    response.json(person)
  })
  .catch(async err => {
    await mongoose.connection.close()
    response.status(404).end()
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

app.post('/persons', cors(corsOptions), async (request, response, next) => {
  const body = request.body
  const person = new Number({
      name: body.name,
      number: body.number
  })

  try{
    await mongoose.connect(url, {
      family: 4,
      serverSelectionTimeoutMS: 30000
    })
    console.log("Connected to Database");
  }catch(err) {
    alert('Failed to connect to Database storage. Error handle:' + err.reason)
  }
    
  person.save()
  .then(async result => {
    console.log(`Added ${result.name} with number ${result.number} to phonebook.`)
    await mongoose.connection.close()
    return response.json(person)})
  .catch(async err => {
    await mongoose.connection.close()
    next(err)
  })
})

app.delete('/persons/:id',cors(corsOptions), async (request, response,next) => {
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
})

app.put('/persons/:id',cors(corsOptions), async (request, response,next) => {
  const id = request.params.id
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
  Number.findByIdAndUpdate(id,{name: body.name, number: body.number}, {runValidators: true})
  .then(async result => {
    console.log(`Updated ${result.name}'s number  to ${body.number}.`)
    await mongoose.connection.close()
    return response.json(result)})
  .catch(async err => {
    await mongoose.connection.close()
    next(err)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(ErrorHandler)
