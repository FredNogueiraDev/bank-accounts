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
            choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Transferir','Sacar', 'Sair'],
        },
    ])
        .then((answer) => {
            const action = answer['action']

            if (action === 'Criar Conta') { createAccount() }
            else if (action === 'Consultar Saldo') { getAccountBalance() }
            else if (action === 'Depositar') { deposit() }
            else if (action === 'Sacar') { withdraw() }
            else if (action === 'Transferir') { transfer() }
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

// get money from account
function  withdraw(){
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual seu nome de usuário?'
            }
        ])
        .then((answer) => {
            const accountName = answer['accountName']

            if(!checkAccount(accountName)){
                return withdraw()
            }

            inquirer
                .prompt([
                    {
                        name: 'amount',
                        message: 'Quanto você deseja sacar?'
                    }
                ])
                .then((answer) => {
                    const amount = answer['amount']

                    removeAmount(accountName, amount)
                    operation()
                })
        })
}
function removeAmount(accountName, amount){
    const accountData = getAccount(accountName);
    
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente...'))
        return withdraw()
    }

    if (accountData.balance < amount){
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`, 
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )
    console.log(chalk.bgGreen.black(`Saque de R$${amount} realizado com sucesso!`))
    console.log(chalk.bgBlue.black(`Seu saldo atualizado é de R$${accountData.balance}`))
}

//transfer money to another user
function transfer(){
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
            return transfer()
        }
        receivingUser(accountName)
    })
}
function receivingUser(accountName){

    inquirer
    .prompt([
        {
            name: 'receiverUser',
            message: 'Para quem você deseja transferir (nome do usuário)?'
        },
    ])
    .then((answer) => {
        const receiverUser = answer['receiverUser'];

        if(!checkAccount(receiverUser)){
            return transfer()
        }

        inquirer
            .prompt([
                {
                    name: 'amount',
                    message: "Quanto você deseja transferir?"
                },
            ])
            .then((answer) => {
                const amount = answer['amount']

                valueVerification(accountName, amount, receiverUser)
            })
    })

}
function valueVerification(accountName, amount, receiverUser){
    const accountData = getAccount(accountName);
    const accountReceiverUserData = getAccount(receiverUser);
    
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente...'))
        return transfer()
    }

    if(accountData.balance === 0){
        console.log(chalk.bgRed.black('Você não possui dinheiro na conta, deposite antes de transferir.'))
        return operation()
    }
    
    if (accountData.balance < amount){
        console.log(chalk.bgRed.black(`Valor indisponível! Seu saldo é de R$${accountData.balance}`))
        return transfer()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    accountReceiverUserData.balance = parseFloat(accountReceiverUserData.balance) + parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`, 
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )
    fs.writeFileSync(
        `accounts/${receiverUser}.json`, 
        JSON.stringify(accountReceiverUserData),
        function(err){
            console.log(err)
        },
    )
    console.log(chalk.bgGreen.black(`transferencia de R$${amount} realizado com sucesso!`))
    console.log(chalk.bgBlue.black(`Seu saldo atualizado é de R$${accountData.balance}`))

    operation()
}

//Exit process
function exitProcess() {
    console.log(chalk.bgBlue.black('Obrigado por escolher o Accounts!'))
    process.exit()
}