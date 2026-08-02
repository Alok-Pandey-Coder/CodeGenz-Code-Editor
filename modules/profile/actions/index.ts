"use server"
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { NextResponse } from "next/server";

interface editProfileData {
  userName: string,
  email: string,
  organization: string,
  birthDate: string,
  gender: string,
  location: string,
  experience: string,
  readMe: string,
  designation: string,
}

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
  profileData.designation = userData.designation
  profileData.organization = userData.organization

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
    userName: existingUser.name ?? "your user Name",
    email: existingUser.email ?? "your email",
    organization: existingUser.organization ?? "your organization",
    designation: existingUser.designation ?? "your designation",
    birthDate: existingUser.birthDate
    ? existingUser.birthDate.toISOString().split("T")[0]
    : "",
    gender: existingUser.gender ?? "Your gender/ prefer not to say",
    location: existingUser.location ?? "user loaction not set",
    experience: existingUser.experience ?? "your experience",
    readMe: existingUser.readMe ?? "no readme",
  }

  return bioData;
} 

export const editProfile = async(formdata: editProfileData) => {
  const user = await currentUser();
  const profile = await db.user.update({
    where: {
      id: user?.id,
    },
    data: {
      name: formdata.userName,
      organization: formdata.organization,
      birthDate: new Date(formdata.birthDate),
      gender: formdata.gender,
      location: formdata.location,
      experience: formdata.experience,
      readMe: formdata.readMe,
      designation: formdata.designation,
    }
  })

  return null;
}

export const getPlaygroundCountsByType = async () => {
  const user = await currentUser();
  if (!user) return null;

  const counts = await db.playground.groupBy({
    by: ["template"],
    where: {
      userId: user.id,
    },
    _count: {
      template: true,
    },
  });

  // shape it into { type, count } instead of Prisma's default { type, _count: { type } }
  const formatted = counts.map((c) => ({
    type: c.template,
    count: c._count.template,
  }));

  return formatted;
};

