import React from 'react'
import MainProfileHeader from '@/modules/profile/components/main-profile-header';
import { ProfileData } from '@/modules/profile/actions';

const ProfilePage = async() => {
  const profiledata = await ProfileData();

  return (
    <>
    <MainProfileHeader userProfileData={profiledata}/>
    
    </>
  )
}

export default ProfilePage;