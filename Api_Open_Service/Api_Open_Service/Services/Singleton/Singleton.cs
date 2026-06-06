namespace Api_Open_Service.Services.Utils
{
    // La palabra "sealed" evita que otras clases hereden de esta y rompan el patrón
    public sealed class Singleton
    {
        // 1. La única instancia de la clase, creada automáticamente al iniciar
        private static readonly Singleton _instancia = new Singleton();

        // 2. Variables globales que quieres reutilizar en todo el sistema
        public decimal IGV { get; set; }
        public string NombreEmpresa { get; set; }
        public string MonedaLocal { get; set; }

        // 3. Constructor PRIVADO: Nadie puede hacer "new Singleton()" desde fuera
        private Singleton()
        {
            // Aquí inicializamos los valores por defecto
            IGV = 0.18m; // 18% 
            NombreEmpresa = "Open Service EIRL";
            MonedaLocal = "PEN";
        }

        // 4. La puerta de acceso global para que las demás clases puedan usarlo
        public static Singleton Instancia
        {
            get
            {
                return _instancia;
            }
        }
    }
}