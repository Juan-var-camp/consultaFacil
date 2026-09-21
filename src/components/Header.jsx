function Header(){
    return(
        
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
            <h1>
                Consulta Facil
            </h1>


            <div className=" flex gap-8 text-gray-500">
                <a>Inicio</a>
                <a>Buscar</a>
                <a>Iniciar Sesion</a>
            </div>
                
        </nav>
        
    )
}

export default Header