#!/usr/bin/env node
/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

//    _____                           _
//   |_   _|                         | |
//     | |  _ __  ___ _ __   ___  ___| |_
//     | | | '_ \/ __| '_ \ / _ \/ __| __|
//    _| |_| | | \__ \ |_) |  __/ (__| |_
//   |_____|_| |_|___/ .__/ \___|\___|\__|
//                   | |
//                   |_|

const {
  initClient,
  printBlock,
  handleApiError,
  unknownCommandHandler,
  checkPref,
  printTransaction,
  print,
  printError,
  printName,
  HASH_TYPES
} = require('./utils')
const program = require('commander')

program
  .option('-H, --host [hostname]', 'Node to connect to', 'https://sdk-testnet.aepps.com')

program
  .command('account <hash>')
  .description('The address of the account to inspect (eg: ak$...)')
  .action(async (hash, cmd) => await getAccountByHash(hash, cmd.parent))

program
  .command('block <hash>')
  .description('The block hash to inspect (eg: bh$...)')
  .action(async (hash, cmd) => await getBlockByHash(hash, cmd.parent))

program
  .command('transaction <hash>')
  .description('The transaction hash to inspect (eg: th$...)')
  .action(async (hash, cmd) => await getTransactionByHash(hash, cmd.parent))

program
  .command('deploy <descriptor>')
  .description('The contract deploy descriptor to inspect')
  .action(async (descriptor, cmd) => await getContractByDescr(descriptor, cmd.parent))

program
  .command('height <height>')
  .description('The height of the chain to inspect (eg:14352)')
  .action(async (height, cmd) => await getBlockByHeight(height, cmd.parent))

program
  .command('name <name>')
  .description('The name to inspect (eg: mydomain.aet)')
  .action(async (name, cmd) => await getName(name, cmd.parent))

// HANDLE UNKNOWN COMMAND
program.on('command:*', () => unknownCommandHandler(program)())

program.parse(process.argv)
if (program.args.length === 0) program.help()

async function getBlockByHash (hash, {host}) {
  try {
    checkPref(hash, HASH_TYPES.block)
    const client = await initClient(host)

    await handleApiError(
      async () => printBlock(await client.api.getBlockByHash(hash))
    )
  } catch (e) {
    printError(e.message)
  }
}

async function getTransactionByHash (hash, {host}) {
  try {
    checkPref(hash, HASH_TYPES.transaction)
    const client = await initClient(host)

    await handleApiError(
      async () => printTransaction(await client.tx(hash))
    )
  } catch (e) {
    printError(e.message)
  }
}

async function getAccountByHash (hash, {host}) {
  try {
    checkPref(hash, HASH_TYPES.account)
    const client = await initClient(host)

    await handleApiError(
      async () => print('Account balance___________ ' + await client.balance(hash))
    )
  } catch (e) {
    printError(e.message)
  }
}

async function getBlockByHeight (height, {host}) {
  height = parseInt(height)
  try {
    const client = await initClient(host)

    await handleApiError(
      async () => printBlock(client.api.getKeyBlockByHeight(height))
    )
  } catch (e) {
    printError(e.message)
  }
}

async function getName (name, {host}) {
  try {
    const client = await initClient(host)

    printName(Object.assign(await client.api.getName(name), {status: 'CLAIMED'}))
  } catch (e) {
    if (e.response && e.response.status === 404) {
      printName({status: 'AVAILABLE'})
      process.exit(1)
    }
    printError(e.message)
  }
}

async function getContractByDescr (descPath, {host}) {
  const descriptor = JSON.parse(require(path.resolve(process.cwd(), descPath)))
  try {
    const client = await initClient(host)

    await handleApiError(
      async () => {
        print('Source________________________ ' + descriptor.source)
        print('Bytecode______________________ ' + descriptor.bytecode)
        print('Address_______________________ ' + descriptor.address)
        print('Transaction___________________ ' + descriptor.transaction)
        print('Owner_________________________ ' + descriptor.owner)
        print('Created_At____________________ ' + descriptor.createdAt)
        printTransaction(await client.tx(descriptor.transaction))
      }
    )
  } catch (e) {
    printError(e.message)
  }
}
