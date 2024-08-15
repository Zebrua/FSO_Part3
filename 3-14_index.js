const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config()

const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})
const Phonenumber = mongoose.model('Phonenumber', personSchema)

morgan.token('data', function getData (req) {
    const body = req.body
    return JSON.stringify(body)
})

app.use(express.static('dist'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.json())

// const baseURL ='/api/persons';

app.get('/hello', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Phonenumber.find({}).then(phonebook => {
        response.json(phonebook)
    })
})

app.get('/info', (request,response) => {
    response.send(
        `<p>Phonbook has ${phonebook.length} people<br/>
        ${new Date()}</p>`)
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

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    phonebook = phonebook.filter(person => person.id !== id)
    
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'required content is missing' 
        })
    }

    const phonenumber = new Phonenumber({
        name: body.name,
        number: body.number
    })
    
    phonenumber.save().then(savedResult => {response.json(savedResult)})
    
})

const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
