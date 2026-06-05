"use client"
import { usePlayground } from '@/modules/playground/hooks/usePlayground'
import { useParams } from 'next/navigation'
import React from 'react'

const MainPlaygroundPage = () => {
  const {id} = useParams<{id: string}>()
  const {playgroundData, isLoading, templateData, error, saveTemplateData} = usePlayground(id)
  console.log("templatedata", templateData)
  console.log("playgrounddata", playgroundData)
  return (
    <div>
      Params: {id}
    </div>
  )
}

export default MainPlaygroundPage