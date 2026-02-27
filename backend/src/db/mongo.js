import { MongoClient } from 'mongodb'

let client

export async function connectMongo({ mongoUri }) {
  if (client) return client
  client = new MongoClient(mongoUri)
  await client.connect()
  return client
}

export function getDb({ dbName }) {
  if (!client) throw new Error('Mongo client not connected')
  return client.db(dbName)
}
