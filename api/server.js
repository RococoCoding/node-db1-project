const express = require("express");

const db = require("../data/dbConfig.js");

function get(id) {
  if (id) {
    return db('accounts')
      .where('id', id)
      .first();
  } else {
    return db('accounts');
  }
}

function getByName(name) {
  return db('accounts')
    .where('name', name)
    .first();
}

function insert(body) {
  return db('accounts')
    .insert(body)
    .then(ids => {
      return get(ids[0]);
    })
}

function update(id, changes) {
  return db('accounts')
    .where({ id })
    .update(changes);
}

function remove(id) {
  return db('accounts')
    .where('id', id)
    .del();
}

const server = express();

server.use(express.json());

server.get('/accounts', getAcct, (req, res) => {
  res.status(200).json(res.data);
});

server.get('/accounts/:id', getAcct, (req, res) => {
  res.status(200).json(res.data);
})

server.post('/accounts', [validateBody, checkUnique], (req, res) => {
  insert(req.body)
    .then(data => {
      res.status(201).json(data);
    })
    .catch(err => {
      console.log(err.message);
      res.status(500);
    })
})

server.put('/accounts/:id', [getAcct, validateBody], (req, res) => {
  if (!req.body.name && !req.body.budget) {
    res.status(400).json(`Edit fields are name and budget only.`);
  } else {
    update(req.params.id, req.body)
      .then(data => {
        res.status(201).json(data);
      })
      .catch(err => {
        console.log(err.message);
        res.status(500);
      })
  }
})

server.delete('/accounts/:id', [getAcct], (req, res) => {
  remove(req.params.id)
    .then(data => {
      res.status(201).json(data);
    })
    .catch(err => {
      console.log(err.message);
      res.status(500);
    })
})

function getAcct(req, res, next) {
  get(req.params.id)
    .then(data => {
      if (data) {
          res.data = data;
      next();
      } else {
        res.status(404).json(`No user was found.`);
      }
    })
    .catch(err => {
      console.log(err.message);
      res.status(500);
    })
}

function validateBody(req, res, next) {
  if (!req.body) {
    res.status(400).json(`No body attached to res.`);
  } else if (!req.body.name) {
    res.status(400).json(`Include name field in body.`);
  } else if (!req.body.budget) {
    res.status(400).json(`Include budget field in body.`);
  }
  next();
}

function checkUnique(req, res, next) {
  getByName(req.body.name)
    .then(data => {
      if (data) {
        res.status(400).json(`Name is already taken.`)
      } else {
        next();
      }
    })
    .catch(err => {
      res.status(500);
    })
}

module.exports = server;
