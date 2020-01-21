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
```

## Includes

### Flujos incluidos

* Tokenizar tarjeta y hacer pago con ese token: Tokenizar una tarjeta significa "guardarla" en la DB de Greenpay, de tal forma se pueden hacer pagos más adelante con esa tarjeta del cliente sin pedirle los datos de nuevo

### Flujos futuros

* Hacer una transacción sin guardar los datos del cliente.

## Disclaimer

Provided As-is.

## License

Apache 2.0