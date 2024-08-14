const mongoose = require('mongoose')

const log = process.argv[2]
const pass = process.argv[3];
const url =
  `mongodb+srv://${log}:${pass}@cluster0.pjkqr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})


const Phonenumber = mongoose.model('Phonenumber', personSchema)

if (!process.argv[4]) {
    Phonenumber.find({}).then(result => {
        result.forEach(phonenumber => {
          console.log(phonenumber)
        })
        mongoose.connection.close()
      })
}

const phonenumber = new Phonenumber({
  name: process.argv[4],
  number: process.argv[5],
})


phonenumber.save().then(result => {
  console.log(`Added ${result.name} number ${result.number} to phonebook.`)
  mongoose.connection.close()
})
