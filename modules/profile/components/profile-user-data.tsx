import React from 'react'
import { Pencil, GraduationCap } from 'lucide-react'
import DoughnutChart from './DoughnutChart'
import Link from 'next/link'
import { userBioInfo } from '../actions'

const SectionHeader = ({ title, onEdit }: { title: string; onEdit?: () => void }) => (
  <div className="flex items-center gap-2 mb-3">
    <h3 className="text-white text-base font-semibold">{title}</h3>
    <button
      onClick={onEdit}
      aria-label={`Edit ${title}`}
      className="text-neutral-400 hover:text-white transition-colors"
    >
      <Link href={"/profile/edit"}>
      <Pencil size={14} />
      </Link>
    </button>
  </div>
)

const ProfileUserData = async() => {
  const userData = await userBioInfo()
  return (
    <div className="bg-black min-h-screen px-6 py-8 w-full overflow-x-hidden">
      <div className="grid grid-cols-2 gap-8 min-w-0">
        {/* Left half — existing profile content */}
        <div className="space-y-8 min-w-0">
          <div className="bg-blue-950/40 border border-blue-900 rounded-xl px-5 py-3 text-center">
            <span className="text-blue-400 text-sm font-medium cursor-pointer hover:underline">
              Complete your profile to let others know you better.
            </span>
          </div>

          <div>
            <SectionHeader title="Basic Information" />
            <p className="text-neutral-500 text-sm">
              Edit your name, contact, location, gender and headline.
            </p>
          </div>

          <div>
            <SectionHeader title="About Me" />
            <p className="text-neutral-300 text-sm">
              {userData?.readMe ?? "Edit your ReadMe"}
            </p>
          </div>

          <div>
            <SectionHeader title="Experience - 0 Years" />
            <p className="text-neutral-500 text-sm">{userData?.experience ?? "Edit your experience"}</p>
          </div>

          
        </div>

        {/* Right half — doughnut chart */}
        <div className="min-w-0">
          <DoughnutChart />
        </div>
      </div>
    </div>
  )
}

export default ProfileUserData