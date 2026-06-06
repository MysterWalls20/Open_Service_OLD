namespace Api_Open_Service.Services.Strategy
{
    public class PagoYapeStrategy : IEstrategiaPago
    {
        public bool ProcesarPago(decimal monto, string concepto)
        {
            Console.WriteLine($"[YAPE] Cobrando {monto} por: {concepto}");
            return true;
        }
        public string ObtenerReferencia() => "YAPE-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
    }
}
