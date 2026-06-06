namespace Api_Open_Service.Services.Strategy
{
    public class PagoEfectivoStrategy : IEstrategiaPago
    {
        public bool ProcesarPago(decimal monto, string concepto)
        {
            Console.WriteLine($"[EFECTIVO] Pago contra entrega de {monto} por: {concepto}");
            return true;
        }
        public string ObtenerReferencia() => "EFE-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
    }
}
