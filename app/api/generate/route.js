import { getUrlCollection } from "@/lib/urls";
import { generateSlug, normalizeUrl, checkSlug } from "@/lib/validate";

const reply = (body, status) => Response.json(body, { status });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return reply({ success: false, error: true, message: "Invalid request." }, 400);
  }

  // 1. Validate the long URL (server-side, never trust the browser)
  const url = normalizeUrl(body.url);
  if (!url) {
    return reply(
      { success: false, error: true, message: "Please enter a valid URL (e.g. https://example.com)." },
      400
    );
  }

  // 2. Use the custom short text, or generate a random one
  const custom = typeof body.shorturl === "string" ? body.shorturl.trim() : "";
  if (custom) {
    const problem = checkSlug(custom);
    if (problem) return reply({ success: false, error: true, message: problem }, 400);
  }

  try {
    const collection = await getUrlCollection();

    // 3. Insert. The unique index rejects duplicates (error code 11000).
    //    For random slugs, retry a few times on the (rare) collision.
    const attempts = custom ? 1 : 5;
    for (let i = 0; i < attempts; i++) {
      const shorturl = custom || generateSlug();
      try {
        await collection.insertOne({ url, shorturl, createdAt: new Date() });
        return reply(
          { success: true, error: false, message: "Short URL generated successfully!", shorturl },
          201
        );
      } catch (err) {
        if (err.code !== 11000) throw err;
        if (custom) {
          return reply(
            { success: false, error: true, message: "That short text is already taken." },
            409
          );
        }
      }
    }
    return reply({ success: false, error: true, message: "Could not generate a unique link. Try again." }, 500);
  } catch (err) {
    console.error(err);
    return reply({ success: false, error: true, message: "Server error. Please try again." }, 500);
  }
}
