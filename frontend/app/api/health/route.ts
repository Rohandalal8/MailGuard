import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  const backendHealthUrl = `${apiUrl.replace(/\/api\/?$/, "")}/health`;

  try {
    const response = await fetch(backendHealthUrl, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: {
          services: {
            backend: "down",
            ai: "down",
          },
        },
      },
      { status: 503 },
    );
  }
}
