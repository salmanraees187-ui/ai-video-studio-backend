export default async function handler(req, res) {
  const apiKey = process.env.LUMA_AGENTS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "LUMA_AGENTS_API_KEY is not configured in Vercel."
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
        "https://agents.lumalabs.ai/v1/generations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "ray-3.2",
            type: "video",
            prompt: prompt.trim(),
            aspect_ratio: aspect_ratio || "16:9",
            video: {
              resolution: "720p",
              duration: "5s"
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.detail || data.error || JSON.stringify(data)
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Video generation failed."
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
        `https://agents.lumalabs.ai/v1/generations/${id}`,
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
          error: data.detail || data.error || JSON.stringify(data)
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Could not check video status."
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed."
  });
}
