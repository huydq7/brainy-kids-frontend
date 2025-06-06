import { NextResponse } from "next/server";
import { api } from "../config";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, getToken } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const token = await getToken({ template: "jwt-clerk" });
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const response = await fetch(api.userDeck(userId), {
      cache: "no-store",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch deck");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 });
  }
}
export async function POST(request: Request) {
    const { userId, getToken } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ template: "jwt-clerk" });

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    try {
        const response = await fetch(api.userDeck(userId), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        }); 

        if (!response.ok) {
            throw new Error("Failed to create deck");
        }

        const data = await response.json(); 
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    const { userId, getToken } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ template: "jwt-clerk" });

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name } = await request.json();

    try {
        const response = await fetch(api.userDeck(userId), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ id, name }),
        });

        if (!response.ok) {
            throw new Error("Failed to update deck");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update deck" }, { status: 500 });
    }
}
