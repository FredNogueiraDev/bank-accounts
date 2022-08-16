//external modules
import inquirer from 'inquirer';
import chalk from 'chalk';

//internal modules
import fs from 'fs';

operation()
function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
        },
    ])
        .then((answer) => {
            const action = answer['action']

            if (action === 'Criar Conta') { createAccount() }
            else if (action === 'Consultar Saldo') { getAccountBalance() }
            else if (action === 'Depositar') { deposit() }
            else if (action === 'Sacar') { }
            else if (action === 'Sair') { exitProcess() }
        })
        .catch((err) => console.log(err))
}

function checkAccount(accountName){
    if (!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe, tente novamente...'))
        return false
    }
    return true
}

//create user account
function createAccount() {
    console.log(chalk.bgGreen.black('Obrigado por escolher o nosso Banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))

    buildAccount()
}
function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o seu nome:'
        },
    ])
        .then((answer) => {
            console.info(answer['accountName'])

            const accountName = answer['accountName'];

            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
                buildAccount(accountName)
            }

            fs.writeFileSync(
                `accounts/${accountName}.json`,
                '{"balance": 0}',
                function (err) { console.log(err) }
            )
            console.log(chalk.green('Conta criada com sucesso!'))
            operation()
        })
}

// return account balance
function getAccountBalance(){
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual seu nome de usuário?'
            }
        ])
        .then((answer) => {
            const accountName = answer['accountName'];

            if(!checkAccount(accountName)){
                return getAccountBalance()
            }
            
            const accountData = getAccount(accountName);

            console.log(chalk.bgBlue.black(`Olá ${accountName}, o saldo da sua conta é de R$${accountData.balance}`))
            operation()
        })
}



// add an amount to user account
function deposit() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual seu nome de usuário?'
            },
        ])
        .then((answer) => {
            const accountName = answer['accountName'];

            if(!checkAccount(accountName)){
                return deposit()
            }

            inquirer
                .prompt([
                    {
                        name: 'amount',
                        message: "Quanto você deseja depositar?"
                    },
                ])
                .then((answer) => {
                    const amount = answer['amount']

                    addAmount(accountName, amount)
                    operation()
                })
        })
}
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    })
    return JSON.parse(accountJSON)
}
function addAmount(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente...'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}




//Exit process
function exitProcess() {
    console.log(chalk.bgBlue.black('Obrigado por escolher o Accounts!'))
    process.exit()
}