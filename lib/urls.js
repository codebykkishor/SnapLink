// Returns the "urls" collection and makes sure `shorturl` has a UNIQUE index,
// so the database itself rejects duplicate short links (even in a race).
import clientPromise from "./mongodb";

let indexReady;

export async function getUrlCollection() {
  const client = await clientPromise;
  const collection = client.db("snaplink").collection("urls");

  if (!indexReady) {
    indexReady = collection
      .createIndex({ shorturl: 1 }, { unique: true })
      .catch((err) => {
        indexReady = undefined; // retry next time
        throw err;
      });
  }
  await indexReady;
  return collection;
}
