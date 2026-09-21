import { Link } from "react-router-dom"

function Header(){
    return(
        
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
            <h1>
                Consulta Facil
            </h1>


            <div className=" flex gap-8 text-gray-500">
                <Link to={"/"}>Inicio</Link>
                <Link to={"/buscar"}>Buscar</Link>
                <Link to={"/login"}>Iniciar Sesion</Link>
            </div>
                
        </nav>
        
    )
}

export default Header