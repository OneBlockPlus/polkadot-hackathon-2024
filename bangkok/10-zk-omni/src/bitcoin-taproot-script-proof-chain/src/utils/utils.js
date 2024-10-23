'use strict'

const request = require('request')

function format() {
    if (arguments.length == 0) return null

    let str = arguments[0]
    for (let i = 1; i < arguments.length; i++) {
        let re = new RegExp('\\{' + (i - 1) + '\\}', 'gm')
        str = str.replace(re, arguments[i])
    }
    return str
}

// Convert normal string to u8 array
function stringToByteArray(str) {
    return Array.from(str, function (byte) {
        return byte.charCodeAt(0)
    })
}

// Convert u8 array to hex string
function toHexString(byteArray) {
    return (
        '0x' +
        Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xff).toString(16)).slice(-2)
        }).join('')
    )
}

// Convert hex string to u8 array buffer
function toByteArray(hexString) {
    if (hexString.substr(0, 2) == '0x') {
        hexString = hexString.substr(2)
    }

    let result = []
    for (let i = 0; i < hexString.length; i += 2) {
        result.push(parseInt(hexString.substr(i, 2), 16))
    }
    return result
}

// Camel-Case to Snake-case
function camelToSnake(object) {
    let newObject = {}
    Object.keys(object).reduce((_, key) => {
        let newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        newObject[newKey] = object[key]
    }, {})
    return newObject
}

// Snake-case to Camel-Case
function snakeToCamel(object) {
    let newObject = {}
    Object.keys(object).reduce((_, key) => {
        let newKey = key.replace(/\_(\w)/g, function (_, letter) {
            return letter.toUpperCase()
        })
        newObject[newKey] = object[key]
    }, {})
    return newObject
}

async function sleep(seconds) {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, seconds * 1000)
    })
}

async function syncRequest(url, method, body) {
    let options = {
        url: url,
        method: method,
        json: true,
        body: body,
    }
    console.log('idle', options)
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            console.log('idle', options)
            if (!error && response.statusCode === 200) {
                resolve(body)
            } else {
                reject(error)
            }
        })
    })
}

function toXOnly(pubKey) {
    return pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)
}

/**
 *
 * @param {Array<string>} u64Array There should be at least four items in the array, but only the first four items will be used
 * @return {bigint}
 */
function toU256FromU64Array(u64Array) {
    let sum =
        (BigInt(u64Array[0]) << 192n) +
        (BigInt(u64Array[1]) << 128n) +
        (BigInt(u64Array[2]) << 64n) +
        BigInt(u64Array[3])
    return sum
}

module.exports = {
    sleep: sleep,
    toHexString: toHexString,
    toByteArray: toByteArray,
    format: format,
    stringToByteArray: stringToByteArray,
    camelToSnake,
    snakeToCamel,
    syncRequest,
    toXOnly,
    toU256FromU64Array,
}
