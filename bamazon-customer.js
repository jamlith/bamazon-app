/*
 *  (bamazon):
 *      bamazon-customer.js - list the products, and allow the user to order
 *                  as he sees fit.
 *
 *-------------------------------------->8------------------------------------*/

var mysql = require('mysql'),
    clc = require('cli-color'),
    inquirer = require('inquirer');

var sql_info = {
    user: "james",
    password: "james",
    host: "localhost",
    database: "bamazon"
};

var products = [],
    ids = [];

function getTable() {
    var cxs = mysql.createConnection(sql_info);
    cxs.connect();
    var query = "SELECT * FROM `products`";
    cxs.query(query, (err, resp, vals) => {
        if (!err) {
            products = JSON.parse(JSON.stringify(resp));
            printTable();
        } else {
            throw Error(err);
        }
    });
    cxs.end();
}
var printTable = function() {
    for (var i = 0; i < products.length; i++) {
        console.log(clc.cyan('#' + products[i].item_id + ': ') + clc.green(products[i].department_name + ' > ') + clc.red(products[i].product_name));
        console.log(clc.red('> ') + clc.white('Only ' + clc.green(products[i].stock_qty) + ' left @ ') + clc.green(products[i].price));
        ids += [ products[i].item_id ];
    }
    submitOrder();
};
var submitOrder = function() {
    var questions = [
        { type: "input",
          name: "id",
          message: "Enter the ID of the item you'd like to order." },
        { type: "input",
          name: "qty",
          message: "Quantity to order?" }
    ];
    inquirer.prompt(questions).then(function(answers) {
        if (ids.indexOf(answers.id) !== -1 && answers.qty > 0) {
            if (products[answers.id].stock_qty >= answers.qty) {
                var qty = products[answers.id].stock_qty - answers.qty;
                updateTable(answers.id, qty);
            }
            else {
                console.log("We don't have enough stock to fill your order... please try again.");
                printTable();
            }
        }
    });
};
function updateTable(id, qty) {
    var cxs = mysql.createConnection(sql_info);
    cxs.connect();
    var query = "UPDATE `bamazon`.`products` SET `stock_qty`='" + qty + "' WHERE `item_id`='" + id + "';";
    console.log(query);
    cxs.query(query, (err, resp, vals) => {
        if (!err) {
            var total = products[id].price * (products[id].stock_qty - qty);
            console.log(clc.white(clc.bold('Order complete!') + '  Total purchase cost: ') + clc.red(total));
            var questions = [
                { type: "confirm",
                  name: "continue",
                  message: "Submit another order?",
                  default: true
                }
            ];
            inquirer.prompt(questions).then((answers) => {
                if (answers.continue) {
                    getTable();
                } else {
                    console.log('Bye!');
                }
            });

        }
        else {
            throw Error(err);
        }
    });

    cxs.end();
}

if (sql_info.user === null) {
    var questions = [
        { type: "input",
          name: "un",
          message: "SQL Username?" },
        { type: "password",
          name: "pw",
          message: "SQL Password?" }
    ];
    inquirer.prompt(questions).then((answers) => {
        sql_info.user = answers.un;
        sql_info.password = answers.pw;
        getTable();
    });
} else {
    getTable();
}
