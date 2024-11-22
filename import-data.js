import { MongoClient } from 'mongodb';
import { Client } from '@elastic/elasticsearch';

const mongoUri = 'mongodb+srv://triet:1@cluster0.cjzmm.mongodb.net/';
const dbName = 'sample_mflix';
const collectionName = 'news';

const esClient = new Client({ node: 'http://localhost:9200' });

async function connectMongoDB() {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
}

async function syncMongoToElasticsearch() {
    const db = await connectMongoDB();
    const collection = db.collection(collectionName);

    const cursor = collection.find();

    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const { _id, ...rest } = doc;
        await esClient.index({
            index: 'news',
            id: _id.toString(),
            document: rest
        });
    }

    console.log('Data synced to Elasticsearch');
}

syncMongoToElasticsearch().catch(console.log);
