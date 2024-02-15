import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { Aoi } from './types/types.ts'

const init = (aoi: Aoi) => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App {...aoi} />
    </React.StrictMode>,
  )
}

const aoi = localStorage.getItem('aoi')
if (!aoi) {
  import('./testData.json').then((aoi) => init(aoi.default))
} else {
  init(JSON.parse(aoi))
}