import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt"
import { db } from "@/lib/db";

export async function POST(req:NextRequest) {

  try {
    const {name, email, password} = await req.json();
    if(!name || !email || !password) {
      return NextResponse.json(
        {message: "Name, email and password are required"},
        {status: 400},
      )
    }

    const existedUser = await db.user.findUnique({where:{email: email}});
    if(existedUser) {
      return NextResponse.json(
        {message:"User with thse credential already existed!"},
        {status: 400} 
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email, 
        password: hashedPassword,
      }
    })

    return NextResponse.json(
      { message: "User registered successfully",
        user: { id: user.id, name: user.name, email: user.email }
      },
      {status: 201}
    )
  } catch (error) {
    console.error("Register error: ", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  } 
}