import React from 'react'

function Card({children}) {
  return (
    <div className='p-8 bg-stone-50'>
      {children}
    </div>
  )
}

export default Card
