import { redirect } from "next/navigation";
import { getUrlCollection } from "@/lib/urls";

// Runs on the server for every visit to /<shorturl>
export default async function Page({ params }) {
  const { shorturl } = await params;

  const collection = await getUrlCollection();
  const doc = await collection.findOne({ shorturl });

  if (doc) {
    redirect(doc.url); // go to the original long URL
  }
  redirect("/"); // unknown short link -> home page
}
