import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/get-user";

function extractVimeoInfo(input: string) {
  if (!input) return null;
  const trimmed = input.trim();

  // If it's a raw numeric ID, e.g. "1057488392"
  if (/^\d+$/.test(trimmed)) {
    return {
      vimeoVideoId: trimmed,
      vimeoEmbedUrl: `https://player.vimeo.com/video/${trimmed}`,
      videoUrl: `https://vimeo.com/${trimmed}`,
    };
  }

  // Regex for matching vimeo URLs (vimeo.com/123456789 or player.vimeo.com/video/123456789)
  const match = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (match && match[1]) {
    const id = match[1];
    return {
      vimeoVideoId: id,
      vimeoEmbedUrl: `https://player.vimeo.com/video/${id}`,
      videoUrl: `https://vimeo.com/${id}`,
    };
  }

  // Fallback if full URL provided
  return {
    vimeoVideoId: "",
    vimeoEmbedUrl: trimmed.includes("player.vimeo.com") ? trimmed : `https://player.vimeo.com/video/${trimmed}`,
    videoUrl: trimmed,
  };
}

export async function POST(request: Request) {
  try {
    const roleHeader = request.headers.get("x-user-role") || (await getUserRole());
    if (roleHeader !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    const apiKey = process.env.VIMEO_API_KEY;

    // Handle JSON payload (e.g. Vimeo URL/ID parsing or Vimeo API call)
    if (contentType.includes("application/json")) {
      const body = await request.json();

      // If client sends direct vimeoUrl or vimeoVideoId
      if (body.vimeoUrl || body.vimeoVideoId || body.url) {
        const urlOrId = body.vimeoUrl || body.vimeoVideoId || body.url;
        const info = extractVimeoInfo(urlOrId);
        return NextResponse.json({ success: true, data: info });
      }

      // If client requests initializing an upload ticket on Vimeo via Vimeo API
      if (apiKey && body.title && body.fileSize) {
        const vimeoRes = await fetch("https://api.vimeo.com/me/videos", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.vimeo.*+json; version=3.4",
          },
          body: JSON.stringify({
            upload: {
              approach: "tus",
              size: body.fileSize,
            },
            name: body.title,
            description: body.description || "Lesson Part Video uploaded via PI App Console",
          }),
        });

        const vimeoData = await vimeoRes.json();
        if (!vimeoRes.ok) {
          let errorMsg = vimeoData.developer_message || vimeoData.error || "Vimeo API error";
          if (errorMsg.includes("missing a user ID") || errorMsg.includes("authentication token")) {
            errorMsg = "Vimeo API Error: Your VIMEO_API_KEY is an unauthenticated token. Please generate a Personal Access Token with 'upload' scope in your Vimeo Developer Portal, or paste a Vimeo video URL/ID directly.";
          }
          return NextResponse.json(
            { success: false, message: errorMsg },
            { status: vimeoRes.status }
          );
        }

        const uri = vimeoData.uri || "";
        const videoId = uri.replace("/videos/", "");
        const embedUrl = vimeoData.player_embed_url || `https://player.vimeo.com/video/${videoId}`;

        return NextResponse.json({
          success: true,
          data: {
            uploadLink: vimeoData.upload?.upload_link,
            vimeoVideoId: videoId,
            vimeoEmbedUrl: embedUrl,
            videoUrl: vimeoData.link || `https://vimeo.com/${videoId}`,
          },
        });
      }
    }

    // Handle FormData upload (streaming video file directly to Vimeo via API Key)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const title = (formData.get("title") as string) || file?.name || "Lesson Video";

      if (!file) {
        return NextResponse.json({ success: false, message: "No video file provided" }, { status: 400 });
      }

      if (!apiKey) {
        return NextResponse.json(
          { success: false, message: "VIMEO_API_KEY is not configured in environment" },
          { status: 500 }
        );
      }

      // Step 1: Create video ticket on Vimeo
      const initRes = await fetch("https://api.vimeo.com/me/videos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.vimeo.*+json; version=3.4",
        },
        body: JSON.stringify({
          upload: {
            approach: "tus",
            size: file.size,
          },
          name: title,
          description: "Uploaded via Admin Console",
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        let errorMsg = initData.developer_message || initData.error || "Failed to initialize Vimeo video";
        if (errorMsg.includes("missing a user ID") || errorMsg.includes("authentication token")) {
          errorMsg = "Vimeo API Error: Your VIMEO_API_KEY is an unauthenticated token. Please generate a Personal Access Token with 'upload' scope in your Vimeo Developer Portal, or paste a Vimeo video URL/ID directly.";
        }
        return NextResponse.json(
          { success: false, message: errorMsg },
          { status: initRes.status }
        );
      }

      const uploadLink = initData.upload?.upload_link;
      const uri = initData.uri || "";
      const videoId = uri.replace("/videos/", "");
      const embedUrl = initData.player_embed_url || `https://player.vimeo.com/video/${videoId}`;

      // Step 2: Stream binary file bytes directly to Vimeo upload_link using TUS/PATCH
      if (uploadLink) {
        const fileBuffer = await file.arrayBuffer();
        await fetch(uploadLink, {
          method: "PATCH",
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": "0",
            "Content-Type": "application/offset+octet-stream",
          },
          body: fileBuffer,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          vimeoVideoId: videoId,
          vimeoEmbedUrl: embedUrl,
          videoUrl: initData.link || `https://vimeo.com/${videoId}`,
        },
      });
    }

    return NextResponse.json({ success: false, message: "Unsupported request content type" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST /api/admin/vimeo/upload] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
