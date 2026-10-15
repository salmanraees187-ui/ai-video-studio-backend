export default async function handler(req, res) {
  const apiKey = process.env.LUMA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "LUMA_API_KEY is not configured in Vercel."
    });
  }

  if (req.method === "POST") {
    try {
      const { prompt, aspect_ratio } = req.body || {};

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          error: "Please enter a video prompt."
        });
      }

      const response = await fetch(
        "https://api.lumalabs.ai/dream-machine/v1/generations/video",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            model: "ray-2",
            aspect_ratio: aspect_ratio || "16:9"
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
  return res.status(response.status).json({
    error: data
  });
      }

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.detail || "Video generation request failed."
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        error: "Server error while starting video generation."
      });
    }
  }

  if (req.method === "GET") {
    try {
      const id = req.query.id;

      if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
        return res.status(400).json({
          error: "A valid generation ID is required."
        });
      }

      const response = await fetch(
        `https://api.lumalabs.ai/dream-machine/v1/generations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.detail || "Could not check video status."
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        error: "Server error while checking video status."
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({
    error: "Method not allowed."
  });
}
