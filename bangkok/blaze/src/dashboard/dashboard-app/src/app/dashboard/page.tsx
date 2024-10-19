import TestComp from '@/components/test-comp'
import { Button } from '@/components/ui/button'
import React from 'react'

export default function page() {
  return (
    <div>
      dashboard page
      <Button>Helllo button</Button>
      <TestComp  />
    </div>
  )
}
