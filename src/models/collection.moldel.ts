/**
 * Recaudos
 */
export interface Collection {
    id?         : string;
    createdAt   : string;   // Fecha de cobro
    paid        : boolean;  // Estado del pago
    amountPaid  : number;   // Cantidad pagada
}