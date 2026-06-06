namespace Api_Open_Service.Services.Strategy
{
    public class PagoTarjetaStrategy : IEstrategiaPago
    {
        public bool ProcesarPago(decimal monto, string concepto)
        {
            Console.WriteLine($"[TARJETA] Procesando {monto} por: {concepto}");
            return true;
        }
        public string ObtenerReferencia() => "VISA-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
    }
}
