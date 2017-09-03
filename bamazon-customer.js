/*
 *  (bamazon):
 *      bamazon-customer.js -list the products table, and allow the user to
 *                 order those that he likes.
 *
 *-------------------------------------->8------------------------------------*/

var mysql = require('mysql')
  , clc = require('cli-color')
  , inquirer = require('inquirer');

var creds = {
  uname: null,
  pass: null
};

var inventory_results = [];
var item_id_list = [];
var logarr = [];

function logArray(arr) {
  if (arr.length < 1) {
    return false;
  } else {
    for (var i = 0; i < arr.length; i++) {
      console.log(arr[i]);
    }
  }
}
function list_items() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: creds.uname,
    password: creds.pass,
    database: 'bamazon'
  });
  connection.connect();
  connection.query('SELECT * FROM`products`', function (err, results, vals) {
    if (! err) {
      inventory_results += results;

      item_id_list += [ results[i].item_id ];
      for (var i = 0; i < results.length; i++) {
        logarr += [ i + ":  ID: " + results[i].item_id ];
        logarr += [ ' > ' + results[i].department_name + ' > ' + results[i].product_name ];
        logarr += [ ' > Only ' + results[i].stock_qty + ' left @ $' + results[i].price ];
      }
      connection.end();
      rcvOrder();
    }
    else {
      connection.end();
      throw Error('Connection failed.')
    }
  });
}
function get_by_id(id) {
  console.log('get_by_id()...');
  if (creds.uname === null || creds.pass === null) creds = getCreds();
  var cxs = mysql.createConnection({
    host: 'localhost',
    user: creds.uname,
    password: creds.pw,
    database: "bamazon"
  });
  cxs.connect();
  var SQL_str = 'SELECT * FROM `products` WHERE `item_id` = ' + id;
  console.log('SQL query: ' + SQL_qry);
  cxs.query(SQL_str, function (err, resp, vals) {
    console.log('resp recvd...');
    if (! err) {
      if (resp.length == 1) {
        console.log('SQL response was everything I could hope for...');
        return resp;
      } else if (resp.length > 1) {
        throw Error('Multiple records were returned with the same UNIQUE item id.');
      } else {
        throw Error('No results for the Item ID you supplied (which seemed fine earlier?');
      }
    }
  });
}
function rcvOrder() {
  var questions = [
  { type: "input",
    name: "id",
    message: "The Item ID you'd like to order?" },
  { type: "input",
    name: "qty",
    message: "Quantity to order?",
    default: 1 }
  ];
  inquirer.prompt(questions).then(function (answers) {
    if (item_id_list.indexOf(answers.id) !== -1 && answers.qty > 0) {
      var target_item = get_by_id(answers.id);
    } else {
      console.log('Invalid input... try again.');
      list_items();
    }
  });
}
function getCreds(next) {
  if (creds.uname !== null) next();
  creds.uname = 'james';
  var init_questions = [
  { type: "input",
    name: "user",
    message: "Username:",
    default: creds.uname },
  { type: "password",
    name: "db_pw",
    message: "Password:" }
  ];
  inquirer.prompt(init_questions).then(function(resp) {
    var userCreds = {
      uname: resp.user,
      pass: resp.db_pw
    };
    next();
  });
}
getCreds(function() {
  console.log(`Got creds... calling list_items`);
  list_items();
});
