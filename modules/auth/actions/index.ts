"use server"

import  {auth} from "@/auth";
import { db } from "@/lib/db"
import { newData } from "../types";

export const getUserById = async(id:string) => {
  try {
    const user = await db.user.findUnique({
      where: {id},
      include: {
        accounts: true
      }
    })
    return user;
  } catch (error) {
    console.log(error);
    return null
  }
}

export const getAccountByUserId = async(userId: string) => {
  try {
    const account = await db.account.findFirst({
      where: {
        userId
      }
    })

    return account
  } catch (error) {
    console.log(error)
    return null
  }
}

export const currentUser = async() => {
  const user = await auth();
  return user?.user;
}

export const updateUserDetails =  async(id:string, newData: newData) => {
  const updatedUser = await db.user.update({
    where: {
      id,
    },
    data: {
      name: newData.userName,
      organization: newData.organization,
      experience: newData.experience,
      location: newData.location,
      readMe: newData.readMe,
      birthDate: newData.birthDate,
      gender: newData.gender,
    }
  })

  if(!updatedUser) {
    return null;
  }

  return updatedUser; 
}