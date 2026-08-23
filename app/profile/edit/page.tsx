"use client"
import React, { useEffect, useState } from 'react'
import { editProfile, userBioInfo } from '@/modules/profile/actions'
import {toast} from "sonner"
import { User, Mail, Building2, Calendar, MapPin, Briefcase, FileText, Loader2, AlertCircle } from 'lucide-react'

//todo make the image edit functionality--

const page = () => {
  //form data blueprint
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    organization: "",
    birthDate: "",
    gender: "",
    location: "",
    experience: "",
    readMe: "",
    designation: "",
  })
    
  const[isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

  //loading the initial existing user data
  const loadUserData = async() => {
    try {
      setIsLoading(true);
      const userData = await userBioInfo();
      if(userData) setFormData(prev => ({...prev, ...userData}))
    } catch (error: any) {
      setError(error?.message ?? "error")
      toast.error("Failed to Load user data")
    }
    finally{
      setIsLoading(false);
    }
  }

  //to fetch the data on every refresh
  useEffect(() => {loadUserData()}, []);

  //handle every changes in form
  const handleChanges = (e:React.ChangeEvent<HTMLInputElement>) => {
    return setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleGenderSelect = (gender: string) => {
    setFormData({ ...formData, gender })
  }

  //defines action performed when submittibng the form
  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedProfile = await editProfile(formData);
    } catch (error: any) {
      setError(error?.message ?? "error");
      toast.error("error while updating user data")
      return null;
    }
    finally {
      setIsLoading(false);
    }
    toast.success("Data updated succefully 🎉")

    return null;
  }

  const inputBase = "w-full bg-[#0d0d0f] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 hover:border-white/20"
  const labelBase = "text-xs font-medium text-gray-400 tracking-wide uppercase mb-2 block"

  return (
    <div className="min-h-screen bg-[#08080a] text-white relative overflow-hidden">
      {/* ambient glow, matches editor's accent theme */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />

      <div className="relative max-w-xl mx-auto px-5 py-12">
        <div className="mb-8">
          <p className="text-xs font-mono text-emerald-500/80 mb-1">// edit_profile.tsx</p>
          <h1 className="text-2xl font-semibold text-white">Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your account details</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0f0f12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 space-y-5"
        >
          {/* User Name */}
          <div>
            <label htmlFor="userName" className={labelBase}>User Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChanges}
                placeholder="Your name"
                className={inputBase}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelBase}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChanges}
                placeholder="you@example.com"
                className={inputBase}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Organization */}
            <div>
              <label htmlFor="organization" className={labelBase}>Organization</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChanges}
                  placeholder="Company / College"
                  className={inputBase}
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className={labelBase}>Designation</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChanges}
                  placeholder="Role / Title"
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className={labelBase}>Birth Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChanges}
                  className={`${inputBase} [color-scheme:dark]`}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className={labelBase}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChanges}
                  placeholder="City, Country"
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className={labelBase}>Gender</label>
            <div className="flex gap-3">
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderSelect(g)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    formData.gender === g
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-[#0d0d0f] text-gray-400 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.gender === g ? "border-emerald-500" : "border-gray-600"
                    }`}
                  >
                    {formData.gender === g && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </span>
                  {g === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className={labelBase}>Experience</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChanges}
                placeholder="e.g. 2 years"
                className={inputBase}
              />
            </div>
          </div>

          {/* Read Me */}
          <div>
            <label htmlFor="readMe" className={labelBase}>Read Me</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <textarea
                id="readMe"
                name="readMe"
                value={formData.readMe}
                onChange={handleChanges as any}
                rows={4}
                placeholder="Tell others about yourself..."
                className={`${inputBase} pt-3 resize-none font-mono text-[13px] leading-relaxed`}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm rounded-lg py-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default page