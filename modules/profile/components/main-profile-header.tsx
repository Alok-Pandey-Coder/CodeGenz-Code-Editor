"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Camera, Settings, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ProfileDataInfo } from '../actions'

interface MainProfileHeaderProps {
  userProfileData: ProfileDataInfo | null
}

const MainProfileHeader = ({ userProfileData }: MainProfileHeaderProps) => {
  const [userProfile] = useState(userProfileData)
  const router = useRouter()

  const userName = userProfile?.userName || "User"
  const avatarUrl = userProfile?.avatarUrl || "/logo2.svg"
  const designationText =
    [userProfile?.organization, userProfile?.designation].filter(Boolean).join(" ") ||
    "No designation yet"
  const allPlaygrounds = userProfile?.allPlaygrounds ?? 0
  const starredPlaygrounds = userProfile?.starredPlaygrounds ?? 0

  return (
    <div className="flex items-center justify-between w-full min-h-[30vh] border-b border-neutral-800 bg-neutral-950 px-8 py-6">
      {/* Left: avatar + info */}
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <Image
            src={avatarUrl}
            alt={userName}
            fill
            className="rounded-full object-cover bg-neutral-800"
          />
          <button
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition"
            aria-label="Change avatar"
          >
            <Camera className="h-3.5 w-3.5 text-neutral-300" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold text-white">{userName}</h1>
          <p className="text-sm text-neutral-400">{designationText}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-orange-400 font-medium cursor-pointer hover:underline">
              {allPlaygrounds} All Playgrounds
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-orange-400 font-medium cursor-pointer hover:underline">
              {starredPlaygrounds} Starred Playgrounds
            </span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button onClick={() => {
          router.push("/profile/edit")
        }} className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 transition">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 text-neutral-300" />
        </button>
      </div>
    </div>
  )
}


export default MainProfileHeader