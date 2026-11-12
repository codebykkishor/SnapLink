"use client";
import Link from "next/link";
import React, { useState } from "react";

const Shorten = () => {
  const [url, setUrl] = useState("");
  const [shorturl, setShorturl] = useState("");
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError("");
    setGenerated("");
    setCopied(false);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, shorturl }),
      });
      const result = await response.json();

      if (result.success) {
        const host = process.env.NEXT_PUBLIC_HOST || window.location.origin;
        setGenerated(`${host}/${result.shorturl}`);
        setUrl("");
        setShorturl("");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Please copy the link manually.");
    }
  };

  return (
    <div className="mx-auto max-w-lg bg-purple-100 my-16 p-8 rounded-lg flex flex-col gap-4">
      <h1 className="font-bold text-2xl">Generate your short URLs</h1>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={url}
          className="px-4 py-2 focus:outline-purple-600 rounded-md"
          placeholder="Enter your URL"
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          value={shorturl}
          className="px-4 py-2 focus:outline-purple-600 rounded-md"
          placeholder="Preferred short text (optional - random if empty)"
          onChange={(e) => setShorturl(e.target.value)}
        />
        <button
          onClick={generate}
          disabled={loading}
          className="bg-purple-500 rounded-lg shadow-lg p-3 py-1 my-3 font-bold text-white disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {generated && (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-lg">Your Link</span>
          <code className="break-all">
            <Link target="_blank" href={generated}>
              {generated}
            </Link>
          </code>
          <button
            onClick={copyLink}
            className="self-start bg-purple-500 rounded-lg shadow-lg p-3 py-1 font-bold text-white"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Shorten;
