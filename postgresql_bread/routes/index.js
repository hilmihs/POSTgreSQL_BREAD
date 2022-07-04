var express = require('express');
var router = express.Router();
var db = require('../db/index.js')
const cookieParser = require('cookie-parser')
const url = require('url')
const path = require('path')
const fs = require('fs')
const Pool = require('pg').Pool
const moment = require('moment')

const pool = new Pool({
  user: "hilmi",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "breaddb"
})


router.get('/', function (req, res, next) {
  // Pagination preparation
  const limit = 3
  let currentOffset;
  let totalPage;
  let currentLink;
  let pageInput = parseInt(req.query.page)
  let data;


  if (!req.query.page) {
    currentOffset = 1;
    pageInput = 1;
  } else {
    currentOffset = parseInt(req.query.page);
  }
  const offset = (limit * currentOffset) - limit;
  

  if (req.url === '/') {
    currentLink = '/?page=1'
  } else {
    if (req.url.includes('/?page')) {
      currentLink = req.url
    } else {
      if (req.url.includes('&page=')) {
        currentLink = req.url
      } else {
        if (req.url.includes('&page=')) {
        } else {
          currentLink = req.url + `&page=${pageInput}`
        }
      }
    }
  }

  
  // Syntax SQL checking
  let sql = "SELECT * FROM data";
  let total = "SELECT COUNT(*) AS total FROM data"
  if (req.query.idCB == 'on' && req.query.id !== '') {
    sql = sql + " WHERE id =" + req.query.id
    total = total + " WHERE id =" + req.query.id
  }
  if (req.query.stringCB == 'on' && req.query.string !== '') {
    if (sql.includes("WHERE")) {
      sql = sql + ` AND string = '${req.query.string}'`
      total = total + ` AND string = '${req.query.string}'`
    } else {
      sql = sql + ` WHERE string = '${req.query.string}'`
      total = total + ` WHERE string = '${req.query.string}'`
    }
  }
  if (req.query.integerCB == 'on' && req.query.integer !== '') {
    if (sql.includes('WHERE')) {
      sql = sql + " AND integerinput =" + req.query.integer
      total = total + " AND integerinput =" + req.query.integer
    } else {
      sql = sql + " WHERE integerinput =" + req.query.integer
      total = total + " WHERE integerinput =" + req.query.integer
    }
  }
  if (req.query.floatCB == 'on' && req.query.float !== '') {
    if (sql.includes('WHERE')) {
      sql = sql + " AND floatinput =" + req.query.float
      total = total + " AND floatinput =" + req.query.float
    } else {
      sql = sql + " WHERE floatinput =" + req.query.float
      total = total + " WHERE floatinput =" + req.query.float
    }
  }
  if (req.query.dateCB == 'on' && req.query.startDate !== '') {
    if (sql.includes('WHERE')) {
      sql = sql + ` AND dateinput BETWEEN '${req.query.StartDate}' AND '${req.query.EndDate}'`
      total = total + ` AND dateinput BETWEEN '${req.query.StartDate}' AND '${req.query.EndDate}'`
    } else {
      sql = sql + ` WHERE dateinput BETWEEN '${req.query.StartDate}' AND '${req.query.EndDate}'`
      total = total + ` WHERE dateinput BETWEEN '${req.query.StartDate}' AND '${req.query.EndDate}'`
    }
  }
  if (req.query.booleanCB == 'on' && req.query.boolean !== '') {
    if (sql.includes('WHERE')) {
      sql = sql + ` AND booleaninput = '${req.query.boolean}'`
      total = total + ` AND booleaninput = '${req.query.boolean}'`
    } else {
      sql = sql + ` WHERE booleaninput = '${req.query.boolean}'`
      total = total + ` WHERE booleaninput = '${req.query.boolean}'`
    }
  }
  if (req.query.sortbyid == 'on') {
    sql = sql + ` ORDER BY id ASC`
  } else if (req.query.sortbyid == 'off') {
    sql = sql + ` ORDER BY id DESC`
  }

  if (req.query.sortbystring == 'on') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, string ASC`
    } else {
      sql = sql + ` ORDER BY string ASC`
    }
  } else if (req.query.sortbystring == 'off') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, string DESC`
    } else {
      sql = sql + ` ORDER BY string DESC`
    }
  }

  if (req.query.sortbyinteger == 'on') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, integerinput ASC`
    } else {
      sql = sql + ` ORDER BY integerinput ASC`
    }
  } else if (req.query.sortbyinteger == 'off') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, integerinput DESC`
    } else {
      sql = sql + ` ORDER BY integerinput DESC`
    }
  }

  if (req.query.sortbyfloat == 'on') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, floatinput ASC`
    } else {
      sql = sql + ` ORDER BY floatinput ASC`
    }
  } else if (req.query.sortbyfloat == 'off') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, floatinput DESC`
    } else {
      sql = sql + ` ORDER BY floatinput DESC`
    }
  }

  if (req.query.sortbydate == 'on') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, dateinput ASC`
    } else {
      sql = sql + ` ORDER BY dateinput ASC`
    }
  } else if (req.query.sortbydate == 'off') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, dateinput DESC`
    } else {
      sql = sql + ` ORDER BY dateinput DESC`
    }
  }

  if (req.query.sortbyboolean == 'on') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, booleaninput ASC`
    } else {
      sql = sql + ` ORDER BY booleaninput ASC`
    }
  } else if (req.query.sortbyboolean == 'off') {
    if (sql.includes('ORDER BY')) {
      sql = sql + `, booleaninput DESC`
    } else {
      sql = sql + ` ORDER BY booleaninput DESC`
    }
  } else 
if (req.url == '/') sql = 'SELECT * FROM data ORDER BY ID ASC'
  sql = sql + ` LIMIT 3 OFFSET ${offset}`
  console.log(sql)
  db.query(sql, (err, result, next) => {
    data = result;
    if (err) {
      return next(err)
    }
    db.query(total, (err, result, next) => {
      if (err) {
        return next(err)
      }
      let count = result;
        totalPage = Math.ceil(count.rows[0].total/ limit);
      res.render('list', { rows: data.rows,
                           page: totalPage, 
                           currentPage: pageInput,
                           query: req.query, 
                           link: req.url, 
                           currentUrl: currentLink,
                          moment })
    })
  })
});

router.get('/add', (req, res) => {
  res.render('add')
})

router.post('/add', (req, res) => {
  db.query(`INSERT INTO DATA(string, integerinput, floatinput, dateinput, booleaninput) 
VALUES ($1, $2, $3, $4, $5)`, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    
  })
  res.redirect('/')
})

router.get('/edit/:id', (req, res) => {
  db.query("SELECT * FROM data ORDER BY id ASC", (err, result, next) => {
    data = result;
    console.log(data.rows[0])
    console.log(req.params.id)

    if (err) {
      return next(err)
    } else {
    res.render('edit', { item: data.rows[req.params.id - 1], moment})
  }
  })
})

router.post('/edit/:id', (req, res) => {
  db.query(`UPDATE data SET string = $1, integerinput = $2,
  floatinput = $3,
  dateinput = $4,
  booleaninput = $5
  WHERE id = $6`, [req.body.string, req.body.integer,
                   req.body.float, req.body.date,
                   req.body.boolean, parseInt(req.params.id)], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      
    })
    res.redirect('/')
})

router.get('/delete/:id', (req, res) => {
  db.query(`DELETE FROM data WHERE id=$1`, [req.params.id], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      
    })
    res.redirect('/')
})


module.exports = router;