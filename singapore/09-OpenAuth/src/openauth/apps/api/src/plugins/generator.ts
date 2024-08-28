import * as fs from 'node:fs'
import path from 'node:path'

import type { FastifyError, FastifyInstance, FastifyPluginOptions, RouteOptions } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

type RouteData = RouteOptions & { path: string }

export const clientGeneratorPlugin = fastifyPlugin(
  (instance: FastifyInstance, options: FastifyPluginOptions, done: (error?: FastifyError) => void): void => {
    const routes: RouteData[] = []
    instance.addHook('onRoute', (route) => {
      routes.push(route)
    })
    instance.addHook('onReady', (done) => {
      generateClient(routes)
      done()
    })
    done()
  },
  { name: 'openauth-client-generator', fastify: '4.x' },
)

function generateClient(routes: RouteData[]) {
  const methods = { admin: '', app: '', user: '' }

  for (const route of routes) {
    if (!route.schema || !['GET', 'POST', 'PATCH', 'DELETE'].includes(route.method.toString())) {
      continue
    }
    const query = route.schema.querystring
    const { body } = route.schema
    const response = route.schema.response as any

    const parts = route.url.split('/')
    const key = parts[1] as 'admin' | 'app' | 'user'
    const httpMethodName = route.method.toString().toLowerCase()
    const methodName = camelize((route.schema as any).summary)
    console.info(methodName, route.method, route.url)

    // process query string
    const paramsTypeModel = getTypeModelFromSchema(route.schema.params)
    let methodParamsTypeModel = paramsTypeModel
    const queryTypeModel = query ? getTypeModelFromSchema(query) : undefined
    if (query) {
      methodParamsTypeModel = { ...methodParamsTypeModel, params: queryTypeModel }
    }
    // process request body
    if (body) {
      const requestBodyTypeModel = getTypeModelFromSchema(body)
      methodParamsTypeModel = { ...methodParamsTypeModel, data: requestBodyTypeModel }
    }

    // process response body
    const should201 = Object.keys(response['201'] ?? {}).length > 0
    const responseTypeModel = getTypeModelFromSchema(should201 ? response['201'] : response['200'])
    const responseStr = getStringFromTypeModel(responseTypeModel)
    const dataSuffixStr = Object.keys(responseTypeModel).join(',') === 'data' ? '.data' : ''

    // process method params
    const methosParamsStr = Object.keys(methodParamsTypeModel)
      .map(key => `${key}: ${getStringFromTypeModel(methodParamsTypeModel[key])}`)
      .join(', ')

    // build URL
    let { url } = route
    for (const key of Object.keys(paramsTypeModel)) {
      url = url.replace(`:${key}`, `\${${key}}`)
    }

    // http params
    let httpParamsStr = ''
    if (body) {
      httpParamsStr += ', data'
    }
    if (query) {
      httpParamsStr += ', { params }'
    }

    methods[key] += `
async ${methodName}(${methosParamsStr}) {
  return (await this.http.${httpMethodName}<${responseStr}>(\`${url}\`${httpParamsStr})).data${dataSuffixStr}
}`
  }

  const relativePathPrefix = '../../../../packages/sdk-core/client/'
  fs.writeFileSync(path.join(__dirname, `${relativePathPrefix}AdminClient.ts`), adminTemplate(methods.admin))
  fs.writeFileSync(path.join(__dirname, `${relativePathPrefix}AppClient.ts`), appTemplate(methods.app))
  fs.writeFileSync(path.join(__dirname, `${relativePathPrefix}UserClient.ts`), userTemplate(methods.user))
}

function adminTemplate(methods: string) {
  return `
import { BaseClient } from './BaseClient'

export class AdminClient extends BaseClient {
  ${methods}
}
`
}

function appTemplate(methods: string) {
  return `
import { BaseClient } from './BaseClient'

export class AppClient extends BaseClient {
  ${methods}
}
`
}

function userTemplate(methods: string) {
  return `
import { BaseClient } from './BaseClient'

export class UserClient extends BaseClient {
  ${methods}
}
`
}

function camelize(str: string) {
  return str
    .replaceAll(/^\w|[A-Z]|\b\w/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
    .replaceAll(/\s+/g, '')
}

function getTypeModelFromSchema(schema: any): any {
  if (!schema) {
    return {}
  }

  if (schema.anyOf) {
    return schema.anyOf.map((i: any) => getStringFromTypeModel(getTypeModelFromSchema(i))).join(' | ')
  }

  if (schema.allOf) {
    return getTypeModelFromSchema({
      type: 'object',
      properties: Object.assign({}, ...schema.allOf.map((i: any) => i.properties)),
    })
  }

  if (schema.type === 'string') {
    return schema.const ? `'${schema.const}'` : 'string'
  }
  if (schema.type === 'integer') {
    return 'number'
  }
  if (schema.type === 'number') {
    return 'number'
  }
  if (schema.type === 'boolean') {
    return 'boolean'
  }
  if (schema.type === 'null') {
    return 'null'
  }

  if (schema.type === 'object') {
    const { properties } = schema
    const result: any = {}
    for (const key in properties) {
      if (!key) { continue }
      const property = properties[key]
      const isOptional = property[Symbol.for('TypeBox.Optional')] === 'Optional'
      result[isOptional ? `${key}?` : key] = getTypeModelFromSchema(property)
    }
    return result
  }

  if (schema.type === 'array') {
    return [getTypeModelFromSchema(schema.items)]
  }

  throw new Error(`Unsupported schema type: ${schema.type}`)
}

function getStringFromTypeModel(typeModel: any): string {
  if (!typeModel) {
    return ''
  }

  if (typeof typeModel === 'string') {
    return typeModel
  }

  // array
  if (Array.isArray(typeModel)) {
    return `${getStringFromTypeModel(typeModel[0])}[]`
  }

  // object
  if (Object.keys(typeModel).length === 0) {
    return 'any'
  }
  const result = []
  for (const key in typeModel) {
    if (!key) { continue }
    result.push(`${key}: ${getStringFromTypeModel(typeModel[key])}`)
  }
  return `{ ${result.join(', ')} }`
}
