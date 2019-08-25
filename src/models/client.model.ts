/**
 * Clientes
 */
export interface Client {
    id                  : string;   // Nro. Cédula
    fullName            : string;   // Nombre completo
    phone               : string;   // Telefonos fijo 
    mobile              : string;   // Celular
    bussinessType       : string;   // Tipo de negocio
    address             : string;   // Direccion del cliente
    neighborhood        : string;   // Barrio
    city                : string;   // Ciudad
    codeudorId?         : string;   // Nro. Cédula del codeudor
    codeodurFullName?   : string;   // Nombre completo del Codeudor
    codeudorMobile?     : string;   // Celular del codeudor
    codeudorAddress?    : string;   // Direccion del codeudor
    billingState        : string;   // Estado de pagos
}