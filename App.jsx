import { useEffect, useState } from 'react'
import axios from "axios"
//const server_base = "http://localhost:3001/persons"
const server_base = "/persons"

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
  return ( 
    <div className='confirmation'>
      {message}
    </div>
  )
}

const ErrorMessage = ({ mess }) => {
  if (mess === null) {
    return null
  }
  return(
    <div className='error'> 
      {mess}
    </div>
  )
}

const createNew = async (data) => {
  const request = axios.post(server_base, data)
  return request.then(response => response.data)
  .catch(error => error.response.data)
}

const getAll = () => {
  const request = axios.get(server_base)
  return request.then(response => response.data)
}

const removeAction = async (id) => {
  const request = await axios.delete(`${server_base}/${id}`)
  .catch((error) => {
    if (error.status === 404) {
        status = "mess"
    }else{
        status = "Error"
    }
    return status
  })
if (request.status == 200){
    status = "message"
}else if (request.status == 204){
    //pass
}else if (request.status == "(pending)"){
    //pass
}
  return status
}

const updateAction = async (person) => {
  const request = axios.put(`${server_base}/${person.id}`, person)
  return request.then(response => response.data)
  .catch(error => error.response.data)
}

const Newport = (props) => {
  const addName = async(event) => {
    event.preventDefault()
    const copy = [...props.persons]
    if (copy.find(({name}) => name === props.newName)) {
      const newcon = confirm(`${props.newName} is already added to phonebook, replace the old number with new?`)
      if (newcon === true){
        const Name = copy.find(({name}) => name === props.newName)
        Name.number = props.newNumber
        const response = await updateAction(Name)
        if (response.error) {
          props.setMess(`${response.error}`)
        await setTimeout(() => {
          props.setMess(null)
        }, 6000)
        }else{
          props.setMessage(`Updated ${props.newName}`)
          await setTimeout(() => {
            props.setMessage(null)
          }, 6000)
          props.setNewName("")
          props.setNewNumber("")
        }
      }
    }
    else{
      const Name = {
        name: props.newName,
        number: props.newNumber
      }
      const response = await createNew(Name)
      if (response.error){
        props.setMess(`${response.error}`)
        await setTimeout(() => {
          props.setMess(null)
        }, 6000)
      }else{
      props.setMessage(`Added ${props.newName}`)
      await setTimeout(() => {
        props.setMessage(null)
      }, 6000)
      copy.push(response)
      props.setPersons(copy)
      props.setNewName("")
      props.setNewNumber("")
    }
    }
  }

  const nametracking = (event) =>{
    // console.log(event.target.value)
    props.setNewName(event.target.value)
  }
  const numbertracking = (event) =>{
    // console.log(event.target.value)
    props.setNewNumber(event.target.value)
  }

  return(
    <form onSubmit={addName}>
        <div>
          name: <input 
          value={props.newName}
          onChange={nametracking}
          />
        </div>
        <div>
          number: <input
          value={props.newNumber}
          onChange={numbertracking}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  ) 
}
const Filtering = (props) => {
  const filternames = (event) =>{
    // console.log(event.target.value)
    props.setFilterName(event.target.value)
  }

  return(
      <form>
        <div>
          filter names with<input
          value={props.filterName}
          onChange={filternames}/>
        </div>
      </form>
  )
}
const Phonebook = (props) => {
  const removePerson = async (person) => {
    status = await removeAction(person.id)
    if (status === "message") {
      props.setMessage(`Deleted ${person.name}.`)
      const phb = props.persons.filter((contact) => contact.name != person.name)
      props.setPersons(phb)
    }
    else if (status === "mess") {
      props.setMess(`Information on ${person.name} has already been removed.`)
    }else if (status === "Preflight"){
      //pass
    }else{
      await alert("Something went wrong.")
    }
    await setTimeout(() => {
      props.setMessage(null)
      props.setMess(null)
    }, 3000)
  }
  if (props.filter === ""){
    const list = props.persons
    return(
      <div>
        {list.map((person) => (
          <>
          <p key={person.id}>{person.name} {person.number}</p>
          <button onClick={() => removePerson(person)}>Delete</button>
          </>
        ))}
      </div>
    )
  }
  else{
    const list = props.persons.filter(({name}) => name.includes(props.filter) === true)
    return(
      <div>
        {list.map((person) => (
          <p key={person.id}>{person.name} {person.number}</p>
        ))}
      </div>
    )
  }
}
const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterName, setFilterName] = useState('')
  const [message, setMessage] = useState(null)
  const [mess, setMess] = useState(null)
  
  useEffect(() => {
    getAll()
    .then(Persons => {
      setPersons(Persons)
    })
  }, [])
  

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <ErrorMessage mess={mess} />
      <div>
        <Filtering filterName={filterName} setFilterName={setFilterName} />
      </div>
      <h2>Add a new</h2>
      <div>
        <Newport persons={persons} newName={newName} filterName={filterName} newNumber={newNumber} setPersons={setPersons}
          setNewName={setNewName} setNewNumber={setNewNumber} message={message} setMessage={setMessage} mess = {mess} setMess={setMess}
          />
      </div>
      <h2>Numbers</h2>
      <div>
        <Phonebook persons={persons} filter={filterName} message={message} setMessage={setMessage} mess = {mess} setMess={setMess} setPersons={setPersons}/>
      </div>
    </div>
  )

}

export default App
