const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://akselyilmaz:<admin>@plm.zryvu.mongodb.net/?retryWrites=true&w=majority&appName=PLM";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your development. You successfully connected to MongoDB"
    );
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
