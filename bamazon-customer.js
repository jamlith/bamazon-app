/*
 *  (bamazon):
 *      bamazon-customer.js -list the products table, and allow the user to
 *                 order those that he likes.
 *
 *-------------------------------------->8------------------------------------*/

var mysql = require('mysql')
  , clc = require('cli-color')
  , inquirer = require('inquirer');

var inventory_results = [];
var item_id_list = [];


function logArray(arr) {
  if (arr.length < 1) {
    return false;
  } else {
    for (var i = 0; i < arr.length; i++) {
      console.log(arr[i]);
    }
    getOrder();
  }
}
function list_items(pw) {
  var li_prompt = inquirer.createPromptModule();
  var sql_pw = null;
  if (pw === null) {
    var pw_query = {
      type: "password",
      name: "sql_pw",
      message: "Password for SQL user james?"
    };
    li_prompt.prompt(pw_query).then((result) => {
      var sql_pw = result.sql_pw;
    });
  } else {
    sql_pw = pw;
  }
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'james',
    password: sql_pw,
    database: 'bamazon'
  });

  connection.connect();
  connection.query('SELECT * FROM`products`', (err, results, vals) => {
    var logarr = [];
    if (! err) {
      inventory_results += results;

      item_id_list += results[i].id;
      for (var i = 0; i < results.length; i++) {
        logarr += [ i + ":  ID: " + results[i].item_id ];
        logarr += [ ' > ' + results[i].department_name + ' > ' + results[i].product_name ];
        logarr += [ ' > Only ' + results[i].stock_qty + ' left @ $' + results[i].price ];
      }
      logArray(logarr);
    }
  });
  connection.end();
}
function get_by_id(id, pw) {
  var gbi_prompt = inquirer.createPromptModule();
  var sql_pw = null;
  if (pw == null) {
    var pw_query = {
      type: "password",
      name: "sql_pw",
      message: "Password for SQL user 'james'?"
    };
    pw_prompt.prompt(pw_query).then((result) => {
        var sql_pw=result.sql_pw;
        console.log(clc.red('PW: ') + clc.italic(sql_pw));
        console.log(result);
    });
  } else {
    sql_pw = pw;
  }
  var cxs = mysql.createConnection({
    host: 'localhost',
    user: 'james',
    password: sql_pw,
    database: "bamazon"
  });
  cxs_state = cxs.connect();
  console.log(cxs_state);
  var SQL_str = 'SELECT * FROM `products` WHERE `item_id` = ' + i;
  console.log('SQL query: ' + SQL_qry);
  cxs.query(SQL_str, (err, resp, vals) => {
    console.log('SQL Query Returned... ' + (err) ? "Fuck, " : "No" + " errors were thrown.  " + resp.length + " record(s) were returned.");
    if (! err) {
      if (resp.length == 1) {
        console.log('SQL response was everything I could hope for...');
        return resp;
      } else if (resp.length > 1) {
        console.log(clc.red('ERROR:') + ' After selecting a product by its unique ID, the idea that multiple records were returned has left me feeling uneasy... Unless i have duplicate records in the sample table, which is a near impossibility, something is fundamentally wrong with this application, and I already know how frustrating its going to be trying to find that needle in a haystack...');
        throw Error('Multiple records were returned with the same UNIQUE item id.');
      } else {
        throw Error('No results for the Item ID you supplied (which seemed fine earlier?)');
      }
    }
  });
}
function getOrder() {
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
    if (item_id_list.indexOf(answers.id)) {
      get_by_id(answers.id);
    } else {
      console.log("The specified Item ID didn't exist... please try again.");
      // confirm: type name message default
      var relistItems = false;
      var confirmation = {
        type: "confirm",
        name: "relist",
        message: "Would you like to reprint the product list?",
        default: false
      };
      inquirer.prompt(confirmation).then((resp) => {
        if (resp.relist) {
          list_items(null);
        }
      });
    }
  });
}
function init() {
  var init_prompt = inquirer.createPromptModule();
  var init_questions = [
  { type: "input",
    name: "user",
    message: "Username:",
    default: "james" },
  { type: "password",
    name: "db_pw",
    message: "Password:",
    default: "boc-choi" }
  ];
  inquirer.prompt(init_questions).then(function(resp) {
    console.log(resp);
  });
}
init();


