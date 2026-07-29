"use server"
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { NextResponse } from "next/server";

export const ProfileData = async() =>  {
  const user = await currentUser();

  if(!user) {
    return null
  }

  const userData = await db.user.findUnique({
    where: {
      id: user.id
    }
  })

  if(!userData) {
    return null
  }

  const profileData = {
    userName: userData?.name || "Alice",
    avatarUrl: user?.image || "/logo2.svg",
  }

  const playgroundsCnt = await db.playground.count({
    where: {
      userId: user.id
    }
  });

  const starredPlaygrounds = await db.playground.count({
    where: {
      starMark: {
        some: {
          userId: user.id,
          isMarked: true,
        }
      }
    }
  })

  profileData.allPlaygrounds = playgroundsCnt;
  profileData.starredPlaygrounds = starredPlaygrounds

  return profileData;
}

export const userBioInfo = async() => {
  const user = await currentUser();
  
  const existingUser = await db.user.findUnique({
    where: {
      id: user?.id
    }
  })

  if(!existingUser) return null

  const bioData = {
    fullName: existingUser.name,
    email: existingUser.email,
    organization: existingUser.organization,
    designation: existingUser.designation,
    brithDate: existingUser.birthDate,
    gender: existingUser.gender,
    location: existingUser.location,
    experience: existingUser.experience,
    readMe: existingUser.readMe
  }

  return bioData;
} 

