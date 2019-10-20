var router = require('express').Router();

router.get('/', function (req, res, next) {
    if (boc_api) {
        if(typeof boc_api.additional_info === "undefined") {
            boc_api.additional_info = {
                    stocks: 'APPPLE INC',
                    defined: false
            }
        }
        console.log(boc_api.additional_info);
        res.render('index', {
            boc_api: boc_api,
            additional_info: boc_api.additional_info
        });
    } else {
        res.status(500).send('BoC SDK not initialized')
    }
})

router.get('/finish_registration', function (req, res, next) {
    if (boc_api) {
        console.log(req.query);
        boc_api.additional_info = req.query;
        boc_api.additional_info.defined = true;
        res.render('index', {
            boc_api: boc_api,
            additional_info: boc_api.additional_info
        });
    } else {
        res.status(500).send('BoC SDK not initialized')
    }
})

router.get('/trading_algos', function (req, res, next) {
    if (boc_api) {
        
        boc_api.additional_info = req.query;
        boc_api.additional_info["defined"] = true;
        res.render('trading_algos', {
            boc_api: boc_api,
            additional_info: boc_api.additional_info
        });
    } else {
        res.status(500).send('BoC SDK not initialized')
    }
})

router.get('/get_market_data', function (req, res, next) {
    if (boc_api) {
        boc_api.get_apple().then(data =>{
            res.render('market_data', {
                boc_api: data
            });
        })
        
    } else {
        res.status(500).send('BoC SDK not initialized')
    }


})

router.get("/getAccountsInSub", function (req, res, next) {
    if (req.query.accountId) {
        boc_api.getSubForAccount(req.query.accountId).then(subForAccount => {
            res.send(subForAccount)
        })
    } else {
        res.status(400)
        res.render('error', {
            error: 'missing information',
        })
    }

})

router.get('/registration', function (req, res, next) {
    if (boc_api) {
        boc_api.get_apple().then(data =>{
            res.render('registration', {
            });
        })
        
    } else {
        res.status(500).send('BoC SDK not initialized')
    }


})


router.get('/account/fundAvailability', function (req, res, next) {
    if (req.query.accountId) {
        boc_api.fundAvailability(req.query.accountId).then(response => {
            res.send(response)
        })
    } else {
        res.status(400)
        res.render('error', {
            error: 'missing information',
        })
    }

})

router.get('/accounts/:accountid/statements', function (req, res, next) {
    var account_id = req.params.accountid;
    var transfersRef = firebase.database().ref("transfers");
    transfersRef.once("value", function(snapshot) {
        var accountTransactions = new Array();
        snapshot.forEach(function(userSnapshot) {
            if (userSnapshot.val().payment_data.debtor.accountId === account_id) {
                accountTransactions.push(userSnapshot.val());
            }
        });
        console.log(accountTransactions);
        res.render('statements', {
            account_id: account_id,
            statements: accountTransactions.reverse(),
        })
    });
    // boc_api.getAccountStatements(account_id).then(accountStatements => {
    //     res.render('statements', {
    //         statements: accountStatements
    //     })
    //     // res.send(accountStatements)
    // })

})

router.get('/accounts/:accountid/balances', function (req, res, next) {
    var account_id = req.params.accountid;
    boc_api.getAvailBalanceForAccount(account_id).then(accountBalance => {
        res.render('balances', {
            account: accountBalance[0]
        })
        // res.send(accountBalance)
    })

})

router.get('/accounts', function (req, res, next) {
    boc_api.getAccounts(function (err, data) {
        if (err) {
            res.send(err)
        } else {
            //res.send(data)
            res_obj = []
            data.forEach(account => {
                boc_api.getAccount(account.accountId, function (err, accountData) {
                    if (err) {
                        throw err;
                    } else {

                        res_obj.push(accountData);
                    }

                    if (res_obj.length === data.length) {
                        res.render('accounts', {
                            accounts: res_obj
                        })
                        // res.send(res_obj);
                    }
                })
            });
        }
    })
})

router.get('/investments', function (req, res, next) {
    var ref = firebase.database().ref("transfers/");
    ref.on("value", function(snapshot) {
        console.log(`snapshot "${snapshot.val()}" provided`);
        if ((snapshot.val() === null)) {
            res.status(400)
            res.render('error', {
                error: 'No Investments found',
            })
        } else {
            var tableOfInvestments = {};
            snapshot.forEach(function(userSnapshot) {
                var paymentData = userSnapshot.val().payment_data;
                var transferData = userSnapshot.val().transfer_data;
                var accountID = paymentData.debtor.accountId;
                var stocks = transferData.stocks;
                // console.log(paymentData.transactionAmount.amount);
                if (typeof tableOfInvestments[accountID] === "undefined") {
                    tableOfInvestments[accountID] = {
                        [stocks]: parseInt(0),
                        accID: accountID,
                    }
                } else {
                    if (typeof tableOfInvestments[accountID][stocks] === "undefined") {
                        tableOfInvestments[accountID][stocks] = parseInt(0);
                    }
                }
                tableOfInvestments[accountID][stocks]  = tableOfInvestments[accountID][stocks] + parseInt(paymentData.transactionAmount.amount);
            });
            tableOfInvestments.total = [];
            tableOfStocks = [];
            var nikeSum = 0;
            var appleSum = 0;
            var teslaSum = 0;
            var yandexSum = 0;
            var bankSum = 0;
            for (investment in tableOfInvestments) {
                var sum = 0;
                if (typeof tableOfInvestments[investment]['NIKE INC'] === "undefined") {
                    continue
                }
                sum += tableOfInvestments[investment]['NIKE INC'];
                nikeSum += tableOfInvestments[investment]['NIKE INC'];
                sum += tableOfInvestments[investment]['APPLE INC'];
                appleSum += tableOfInvestments[investment]['APPLE INC'];
                sum += tableOfInvestments[investment]['TESLA INC'];
                teslaSum += tableOfInvestments[investment]['TESLA INC'];
                sum += tableOfInvestments[investment]['YANDEX N.V.'];
                yandexSum += tableOfInvestments[investment]['YANDEX N.V.'];
                sum += tableOfInvestments[investment]['BANK OF AMERICA CORP'];
                bankSum += tableOfInvestments[investment]['BANK OF AMERICA CORP'];
                console.log(nikeSum);
                tableOfInvestments.total[investment] = sum;

            }
            tableOfStocks.push(nikeSum)
            tableOfStocks.push(appleSum)
            tableOfStocks.push(teslaSum)
            tableOfStocks.push(yandexSum)
            tableOfStocks.push(bankSum)
            console.log(tableOfStocks);
            res.render('investments', {
                investments_summary: tableOfInvestments,
                stocks: tableOfStocks
            
            })
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
})

router.get('/accounts/:accountid', function (req, res, next) {
    var account_id = req.params.accountid;
    boc_api.getAccount(account_id, function (err1, accountData) {
        boc_api.getAccountPayments(account_id, function (err2, paymentList) {
            var obj = {
                paymentlist: paymentList,
                additional_info: boc_api.additional_info
            }
            console.log(accountData.additional_info)
            if (!accountData.fatalError) {
                res.render('account', {
                    account: Object.assign(obj, accountData[0])
                })
            } else {
                res.status(500)
                res.render('error', {
                    error: 'Account ID is invalid',
                })
            }

            // res.send(Object.assign(obj, accountData[0]))
        })
    })

})

router.get("/payment/:paymentId", function (req, res, next) {
    var payment_id = req.params.paymentId;
    var ref = firebase.database().ref("transfers/" + payment_id);

    ref.on("value", function(snapshot) {
        console.log(`snapshot "${snapshot.val()}" provided`);
        if ((typeof payment_id === "undefined")) {
            res.status(400)
            res.render('error', {
                error: 'You have not done any Invesments',
            })
        } else if ((snapshot.val() === null)) {
            res.status(400)
            res.render('error', {
                error: 'Invalid payment ID',
            })
        } else if((typeof snapshot.val().payment_data.paymentDetails === "undefined")) {
            res.status(400)
            res.render('error', {
                error: 'Invalid payment ID',
            })
        } else {
            res.render('payment', {
                payment_auth: snapshot.val().payment_auth,
                payment_data: snapshot.val().payment_data,
                transfer_data: snapshot.val().transfer_data,
            })
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
})

router.get("/payment", function (req, res, next) {
    var payment_id = boc_api.last_payment_id;
    var ref = firebase.database().ref("transfers/" + payment_id);

    ref.on("value", function(snapshot) {
        if ((typeof payment_id === "undefined")) {
            res.status(400)
            res.render('error', {
                error: 'You have not done any Invesments',
            })
        } else if ((typeof snapshot.val() === "undefined")) {
            res.status(400)
            res.render('error', {
                error: 'Invalid payment ID',
            })
        } else if((typeof snapshot.val().payment_data.paymentDetails === "undefined")) {
            res.status(400)
            res.render('error', {
                error: 'Invalid payment ID',
            })
        } else {
            res.render('payment', {
                payment_auth: snapshot.val().payment_auth,
                payment_data: snapshot.val().payment_data,
                transfer_data: snapshot.val().transfer_data,
            })
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
      
})

router.get('/pay', function (req, res, next) {
    if (req.query.creditorIban && req.query.debtorIban && req.query.amount && req.query.stocks) {
        const creditorIban = req.query.creditorIban
        const debtorIban = req.query.debtorIban
        const amount = req.query.amount

        if(creditorIban == debtorIban){
            res.status(400)
            res.render('error', {
                error: 'Please verify creditor and debtor account IDs are correct',
            })
        }
        else{
        boc_api.signPaymentRequest(creditorIban, debtorIban, amount, "SDK test payment", function (err, data) {
            if (err) {
                res.send(err)
            } else {
                //res.send(data)
                boc_api.createPayment(data, function (err, paymentResult) {
                    if (err) {
                        res.send(err)
                    } else {
                        if((typeof paymentResult.payment === "undefined")){
                            res.status(400)
                            res.render('error', {
                                error: 'Please verify creditor and debtor account IDs are correct',
                            })
                        }
                        else{
                        boc_api.last_payment_id = paymentResult.payment.paymentId;
                        boc_api.approvePayment(paymentResult.payment.paymentId, function (err, paymentAuthorizeResult) {
                            if (err) {
                                res.send(err)
                            } else {
                                var paymentID = paymentResult.payment.paymentId;
                                let paymentRef = firebase.database().ref('transfers/');
                                var transferData = {
                                    "stocks": req.query.stocks,
                                }
                                paymentRef.child(paymentID).set(
                                    {
                                        "payment_auth": paymentAuthorizeResult,
                                        "payment_data": paymentResult.payment,
                                        "transfer_data": transferData,
                                    }).then().catch();
                                console.log("my object: %o", paymentResult);
                                res.render('pay', {
                                    result: paymentAuthorizeResult,
                                    payment_data: paymentResult.payment.transactionAmount,
                                    paymentId: paymentResult.payment.paymentId,
                                    stocks_name: req.query.stocks
                                })
                                // res.send(paymentAuthorizeResult)
                            }
                        })
                    }
                    }
                })
            }
        })
    }

    } else {
        res.status(400)
        res.render('error', {
            error: 'missing information',
        })
    }

})

module.exports = router;