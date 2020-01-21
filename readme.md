# Greenpay SDK

Librería cliente para consumir el API de GreenPay desde NodeJS con Typescript.

## Usar

```bash
npm i greenpay-sdk --save
```

## Test

Para probar llene los datos del .env según lo que le dio Greenpay y corra

```bash
npm i
npm test
```

## Includes

### Flujos incluidos

* Tokenizar tarjeta (detalles desencriptados de tarjeta) y hacer pago con ese token: Tokenizar una tarjeta significa "guardarla" en la DB de Greenpay, de tal forma se pueden hacer pagos más adelante con esa tarjeta del cliente sin pedirle los datos de nuevo. Dos funciones de las pruebas:
  * `should tokenize the card`
  * `should make a transaction with token`

El flujo es: uno solicita un token de sesión a Greenpay, usa ese token de sesión para tokenizar los detalles de tarjeta de crédito al enviar un secundo request a Greenpay. Usa ese token de tarjeta para hacer el pago.

* Hacer un pago enviando los detalles de la tarjeta encriptados desde "afuera" (i.e.: front end). Tokeniza la tarjeta y además hace el pago.
  * `should make a payment with details of a credit card encrypted from frontend`

Este flujo es un poco más complejo porque el front end se ve involucrado. Por PCI este es el flujo preferencial.

![greenpay PCI flujo](/img/greenpay1.png)


### Flujos futuros

* Hacer una transacción sin guardar los datos del cliente (one time payment).

## Disclaimer

Provided As-is.

## License

Apache 2.0