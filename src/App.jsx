import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Buscar from './pages/Buscar'
import Login from './pages/Login'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (

    <div>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar" element={<Buscar/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>

      
      
    </div>

  )
}

export default App