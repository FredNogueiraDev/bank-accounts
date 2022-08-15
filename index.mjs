//modulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';

//modulos internos
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

            if (action === 'Criar Conta'){createAccount()}
            else if(action === 'Consultar Saldo'){}
            else if(action === 'Depositar'){}
            else if(action === 'Sacar'){}
            else if(action === 'Sair'){exitProcess()}
        })
        .catch((err) => console.log(err))
}

//Create an account
function createAccount(){
    console.log(chalk.bgGreen.black('Obrigado por escolher o nosso Banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))

    buildAccount()
}

function buildAccount(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Digite o seu nome:'
        },
    ])
    .then((answer) => {
        console.info(answer['accountName'])

        const accountName = answer['accountName'];

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
            buildAccount(accountName)
        }

        fs.writeFileSync(
            `accounts/${accountName}.json`,
            '{"balance": 0}',
            function(err){console.log(err)}
        )
        console.log(chalk.green('Conta criada com sucesso!'))
        operation()
    })
}

//Exit process
function exitProcess(){
    console.log(chalk.bgBlue.black('Obrigado por escolher o Accounts!'))
    process.exit()
}