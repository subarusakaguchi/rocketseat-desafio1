const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const verifiedUser = users.find((user) => {return user.username === username})

  if (verifiedUser) {
    request.user = verifiedUser
    return next()
  } else if (!verifiedUser){
    return response.status(404).json({ error: "Username not found" })
  }
}

// Como a função abaixo se repetia, decidi transformá-la em um Middleware também

function checkIfTodoIdExists(request, response, next) {
  const { user } = request
  const todoId = request.params.id

  const todo = user.todos.find((task) => {return task.id === todoId})

  if (todo) {
    request.todo = todo
    return next()
  } else if (!todo) {
    return response.status(404).json({ error: "Todo not found" })
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const checkIfUserExists = users.find((user) => {return user.username == username})

  if (!checkIfUserExists) {
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(newUser)
  
    return response.status(201).json(newUser)
  } else if (checkIfUserExists) {
    return response.status(400).json({ error: "Username already exists" })
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, checkIfTodoIdExists, (request, response) => {
  const { title, deadline } = request.body
  const { todo } = request

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkIfTodoIdExists, (request, response) => {
  const { todo } = request

  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkIfTodoIdExists, (request, response) => {
  const { user, todo } = request

  user.todos = user.todos.filter((task) => {return task != todo})

  return response.status(204).send()
});

module.exports = app;