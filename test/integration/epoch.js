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

import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import { configure, url, internalUrl } from './'
import Epoch from '../../es/epoch'
import * as R from 'ramda'

describe('Epoch client', function () {
  configure(this)

  let client

  before(async function () {
    client = await Epoch({ url, internalUrl })
  })

  it('determines remote version', () => {
    expect(client.version).to.be.a('string')
    expect(client.revision).to.be.a('string')
  })

  it('loads operations', async () => {
    expect(client.methods).to.include.members(['postTransaction', 'getCurrentKeyBlock'])
  })

  it('gets key blocks by height for the first 3 blocks', () => {
    expect(client.api.getKeyBlockByHeight).to.be.a('function')
    expect(client.api.getKeyBlockByHeight.length).to.equal(1)

    return Promise.all(
      R.range(1, 3).map(async i => {
        const result = await client.api.getKeyBlockByHeight(i)
        expect(result.height, i).to.equal(i)
      })
    )
  })
})
