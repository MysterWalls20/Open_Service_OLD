namespace Api_Open_Service.Services.Strategy
{
    public class ContextoPago
    {
        private IEstrategiaPago _estrategia;

        // Se inyecta la estrategia al crear el contexto
        public ContextoPago(IEstrategiaPago estrategia)
        {
            _estrategia = estrategia;
        }

        // Permite cambiar la estrategia en tiempo de ejecución si fuera necesario
        public void SetEstrategia(IEstrategiaPago estrategia)
        {
            _estrategia = estrategia;
        }

        public bool EjecutarPago(decimal monto, string concepto)
        {
            return _estrategia.ProcesarPago(monto, concepto);
        }

        public string ObtenerReferencia()
        {
            return _estrategia.ObtenerReferencia();
        }
    }
}
