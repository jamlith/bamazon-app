/*
 *  (bamazon):
 *      bamazon-customer.js -
 *
 *-------------------------------------->8------------------------------------*/

var mysql = require('mysql')
  , clc = require('cli-color')
  , prompt = require('prompt');

function list_table() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'james',
    password: 'cr4Sh988',
    database: 'bamazon'
  });

  connection.connect();
  connection.query('SELECT * FROM`products`', (err, results, vals) => {
    if (! err) {
      for (var i = 0; i < results.length; i++) {
        console.log('#' + i + ":  ID: " + results[i].item_id);
        console.log(' > ' + results[i].department_name + ' > ' + results[i].product_name);
        console.log(' > Only ' + results[i].stock_qty + ' left @ $' + results[i].price);
      }
    }
  });
  connection.end();
}
function getInput() {
  prompt.start();
  prompt.get(['id_to_buy', 'quantity'], (err, result) => {
    return [ result.id_to_buy, result.quantity ];
  });
}
list_table();
console.log(getInput());
