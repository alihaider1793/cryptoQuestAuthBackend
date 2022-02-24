const mysql = require('mysql');
const express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());
const bodyparser = require('body-parser');
const { response } = require('express');

app.use(bodyparser.json());

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cryptoquest_auth',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});


app.listen(3501, () => console.log('Express server is runnig at port no :3501'));


//Get all users
app.get('/users', (req, res) => {
    mysqlConnection.query('SELECT * FROM user', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get an users
app.get('/users/:id', (req, res) => {
    mysqlConnection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            response.send(rows['insertId']);
        else
            console.log(err);
    })
});

//Delete an users
app.delete('/users/:id', (req, res) => {
    mysqlConnection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Deleted successfully.');

        else
            console.log(err);
    })
});

app.post('/users', (request, response) => {
    mysqlConnection.query('INSERT INTO user (wallet_address, verification_code) VALUES (?,?)', [request.body.wallet_address, request.body.verification_code], (err, rows, fields) => {
        if (!err) {
            let inserted_id = response.insertId;
            response.send(inserted_id);
            // response.send(fields);
        }
        else
            response.send(err);
    })
});

app.post('/verify_code', (request, response) => {
    mysqlConnection.query('SELECT * FROM user WHERE verification_code = ?', [request.body.verification_code], (err, rows, fields) => {
        if (!err) {
            // response.send({"test":request.body.verification_code});
            response.send(rows);
        }
        else {
            response.send(err);
        }
    })
});

app.post('/store_verification_code_in_db', (request, response) => {
    mysqlConnection.query('SELECT * FROM user WHERE wallet_address = ?', [request.body.wallet_address], (err, rows, fields) => {
        if (!err) {
            const vCode = Math.floor(
                Math.random() * (9999 - 1000) + 1000
            );
            // response.send(rows);
            if (rows.length != 0) {
                mysqlConnection.query('UPDATE user SET verification_code=? WHERE wallet_address=?', [vCode, request.body.wallet_address], (err, rows, fields) => {
                    if (!err) {
                        mysqlConnection.query('SELECT * FROM user WHERE wallet_address = ?', [request.body.wallet_address], (err, rows, fields) => {
                            if (!err) {
                                response.header("Access-Control-Allow-Origin", "*");
                                response.send({ "verification_code": rows[0].verification_code });
                            }
                            else {
                                response.send(err);
                            }
                        })
                    }
                    else {
                        response.send(err);
                    }
                });
            }
            else {
                mysqlConnection.query('INSERT INTO user (wallet_address, verification_code) VALUES (?,?)', [request.body.wallet_address, vCode], (err, rows, fields) => {
                    if (!err) {
                        mysqlConnection.query('SELECT * FROM user WHERE wallet_address = ?', [request.body.wallet_address], (err, rows, fields) => {
                            if (!err) {
                                response.header("Access-Control-Allow-Origin", "*");
                                response.send({ "verification_code": rows[0].verification_code });
                            }
                            else {
                                response.send(err);
                            }
                        })
                    }
                    else {
                        response.send(err);
                    }
                })
            }
            // console.log(rows.length);
        }
        else {
            response.send(err);
        }
    })
});

// function updateVerificationCode(wallet_address)
// {
//     app.post('/store_verification_code_in_db', (request, response) => {
//         mysqlConnection.query('UPDATE user SET verification_code=? WHERE wallet_address=?', ['123123', wallet_address], (err, rows, fields) => {
//             if (!err) {
//                 response.send(rows);
//             }
//             else {
//                 response.send(err);
//             }
//         })
//     });
// }

// function setVerificationCode(wallet_address)
// {
//     app.post('/store_verification_code_in_db', (request, response) => {
//         mysqlConnection.query('INSERT INTO user (wallet_address, verification_code) VALUES (?,?)', [wallet_address, '000000'], (err, rows, fields) => {
//             if (!err) {
//                 response.send(rows);
//             }
//             else {
//                 response.send(err);
//             }
//         })
//     });
// }


// //Insert a user
// app.post('/users', (req, res) => {
//     let usr = req.body;
//     var sql = "SET @wallet_address = ?;SET @verification_code = ?;";
//     mysqlConnection.query(sql, [usr.wallet_address, usr.verification_code], (err, rows, fields) => {
//         if (!err)
//             rows.forEach(element => {
//                 if (element.constructor == Array)
//                     res.send('Inserted user id : ' + element[0].id);
//             });
//         else
//             console.log(err);
//     })
// });

// //Update an employees
// app.put('/employees', (req, res) => {
//     let emp = req.body;
//     var sql = "SET @EmpID = ?;SET @Name = ?;SET @EmpCode = ?;SET @Salary = ?; \
//     CALL EmployeeAddOrEdit(@EmpID,@Name,@EmpCode,@Salary);";
//     mysqlConnection.query(sql, [emp.EmpID, emp.Name, emp.EmpCode, emp.Salary], (err, rows, fields) => {
//         if (!err)
//             res.send('Updated successfully');
//         else
//             console.log(err);
//     })
// });